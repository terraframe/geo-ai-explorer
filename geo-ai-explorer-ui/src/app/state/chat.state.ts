import { v4 as uuidv4 } from 'uuid';
import { createReducer, on, createActionGroup, props, createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatMessage } from '../models/chat.model';
import { MockUtil } from '../mock-util';

const parseText = (m: ChatMessage): ChatMessage => {

    const message = { ...m }
    message.sections = [];

    const tokens = message.text.replaceAll('\n', "<br/>").split('<location>')

    const text = tokens.forEach(token => {

        const pattern = /<label>(.*)<\/label><uri>(.*)<\/uri><\/location>(.*)/

        if (pattern.test(token)) {
            const values = pattern.exec(token);
            const label: string = values?.at(1) as string;
            const uri: string = values?.at(2) as string;
            const post: string = values?.at(3) as string;

            message.sections?.push({ type: 1, text: label, uri: uri })
            message.sections?.push({ type: 0, text: post })
        }
        else {
            message.sections?.push({ type: 0, text: token })
        }
    })

    return message;
}


export const ChatActions = createActionGroup({
    source: 'chat',
    events: {
        'Add Message': props<ChatMessage>(),
        'setMessageAndSession': props<{ messages: ChatMessage[], sessionId: string }>(),
    },
});

export interface ChatStateModel {
    sessionId: string;
    messages: ChatMessage[];
}

export const initialState: ChatStateModel = {
    messages: MockUtil.messages.map(m => parseText(m)),
    sessionId: uuidv4()
}


export const chatReducer = createReducer(
    initialState,
    on(ChatActions.addMessage, (state, message) => {

        const messages = [...state.messages];
        messages.push(parseText(message));

        return { ...state, messages }
    }),
    on(ChatActions.setMessageAndSession, (state, wrapper) => {
        return { ...state, messages: wrapper.messages, sessionId: wrapper.sessionId }
    }),
);

const selector = createFeatureSelector<ChatStateModel>('chat');

export const getMessages = createSelector(selector, (s) => {
    return s.messages;
});

export const getSessionId = createSelector(selector, (s) => {
    return s.sessionId;
});
