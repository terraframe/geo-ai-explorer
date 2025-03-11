import { createActionGroup, props } from '@ngrx/store';
import { ChatMessage } from '../models/chat.model';

export const ChatActions = createActionGroup({
    source: 'chat',
    events: {
        'Add Message': props<ChatMessage>(),
        'setMessageAndSession': props<{ messages: ChatMessage[], sessionId: string }>(),
    },
});
