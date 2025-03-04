import { Injectable } from '@angular/core';
import { MockUtil } from './mock-util';

export interface ChatMessage {
  sender: 'user' | 'system';
  text: string;
  mappable: boolean;
}

interface ServerChatResponse {
  content: string;
  sessionId: string;
  mappable: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private sessionId: string | null = null;

  private messages: ChatMessage[] = MockUtil.messages;

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  sendChat(message: ChatMessage): Promise<ChatMessage> {
    this.messages.push(message);

    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulated server response
        const response: ChatMessage = {
          sender: 'system',
          text: MockUtil.getRandomLoremIpsum(),
          mappable: false,
        };
        this.messages.push(response);
        resolve(response);
      }, 3000); // Simulating 3-second network delay

      // Uncomment below to make a real HTTP request
      // return this.http.post<ServerChatResponse>('api/chat/prompt', { message })
      //   .toPromise()
      //   .then(response => {
      //     const chatMessage: ChatMessage = {
      //       sender: 'system',
      //       text: response.content,
      //       mappable: response.mappable,
      //     };
      //     this.messages.push(chatMessage);
      //     return chatMessage;
      //   });
    });
  }
}