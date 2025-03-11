import { v4 as uuidv4 } from 'uuid';
import { createReducer, on, createActionGroup, props, createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatMessage } from '../models/chat.model';
import { MockUtil } from '../mock-util';

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
    messages: MockUtil.messages,
    sessionId: uuidv4()
}

export const chatReducer = createReducer(
    initialState,
    on(ChatActions.addMessage, (state, message) => {
        const messages = [...state.messages];
        messages.push(message);

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
