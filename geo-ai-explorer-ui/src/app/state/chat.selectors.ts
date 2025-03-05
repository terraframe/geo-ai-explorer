import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ChatStateModel } from "./chat.reducer";

const selector = createFeatureSelector<ChatStateModel>('chat');

export const selectMessages = createSelector(selector, (s) => {
    return s.messages;
});

export const selectSessionId = createSelector(selector, (s) => {
    return s.sessionId;
});