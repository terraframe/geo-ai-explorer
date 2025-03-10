import { v4 as uuidv4 } from 'uuid';
import { createReducer, on } from '@ngrx/store';
import { ChatMessage } from '../models/chat.model';
import { ChatActions } from './chat.actions';
import { MockUtil } from '../mock-util';

export interface ChatStateModel {
    sessionId: string;
    messages: ChatMessage[];
}

export const initialState: ChatStateModel = {
    messages: [],
    sessionId: uuidv4()
}

export const chatReducer = createReducer(
    initialState,
    on(ChatActions.addMessage, (state, message) => {
        const messages = [...state.messages];
        messages.push(message);

        return { ...state, messages }
    }),
);