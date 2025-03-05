import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { ChatMessage, Location, ServerChatResponse } from './models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  constructor(private http: HttpClient) {
  }


  sendMessage(sessionId: string, message: ChatMessage): Promise<ChatMessage> {

    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     // Simulated server response
    //     const response: ChatMessage = {
    //       sender: 'system',
    //       text: MockUtil.getRandomLoremIpsum(),
    //       mappable: false,
    //     };

    //     resolve(response);
    //   }, 3000); // Simulating 3-second network delay

    // Uncomment below to make a real HTTP request

    let params = new HttpParams();
    params = params.append("sessionId", sessionId);
    params = params.append("prompt", message.text);

    return firstValueFrom(this.http.get<ServerChatResponse>('http://localhost:8080/api/chat/prompt', { params })).then(response => {
      const chatMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'system',
        text: response.content,
        mappable: response.mappable,
      };
      return chatMessage;
    });
  }

  getLocations(messages: ChatMessage[]): Promise<Location[]> {

    const data = messages.map(message => ({
      type: message.sender === 'user' ? 'USER' : 'AI',
      content: message.text
    }))

    return firstValueFrom(this.http.post<Location[]>('http://localhost:8080/api/chat/get-locations', { messages: data }));
  }

}