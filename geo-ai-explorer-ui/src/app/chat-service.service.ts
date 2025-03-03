import { Injectable } from '@angular/core';

interface ChatMessage {
  sender: 'user' | 'system';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messages: ChatMessage[] = [];

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  addMessage(message: ChatMessage) {
    this.messages.push(message);
  }
}
