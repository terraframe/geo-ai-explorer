import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { ChatMessage, ServerChatResponse } from '../models/chat.model';
import { MockUtil } from '../mock-util';
import { environment } from '../../environments/environment';
import { GeoObject } from '../models/geoobject.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  constructor(private http: HttpClient) {
  }


  sendMessage(sessionId: string, message: ChatMessage): Promise<ChatMessage> {

    return new Promise<ChatMessage>((resolve) => {
      setTimeout(() => {
        // Simulated server response
        const response: ChatMessage = {
          id: uuidv4(),
          sender: 'system',
          text: MockUtil.getRandomLoremIpsum(),
          mappable: false,
        };

        resolve(response);
      }, 3000); // Simulating 3-second network delay
    });

    // Uncomment below to make a real HTTP request
    // let params = new HttpParams();
    // params = params.append("sessionId", sessionId);
    // params = params.append("prompt", message.text);

    // return firstValueFrom(this.http.get<ServerChatResponse>(environment.apiUrl + 'api/chat/prompt', { params })).then(response => {
    //   const chatMessage: ChatMessage = {
    //     id: uuidv4(),
    //     sender: 'system',
    //     text: response.content,
    //     mappable: response.mappable,
    //   };
    //   return chatMessage;
    // });
  }

  getLocations(messages: ChatMessage[]): Promise<GeoObject[]> {
    return new Promise<GeoObject[]>((resolve) => {
      setTimeout(() => {


        resolve(MockUtil.locations);
      }, 3000); // Simulating 3-second network delay
    }).then(objects => {
      objects.map(object => object.properties.uri = '<' + object.id + '>');

      return objects;
    });

    // // Uncomment below to make a real HTTP request
    // const data = messages.map(message => ({
    //   type: message.sender === 'user' ? 'USER' : 'AI',
    //   content: message.text
    // }))

    // return firstValueFrom(this.http.post<GeoObject[]>(environment.apiUrl + 'api/chat/get-locations', { messages: data })).then(objects => {
    //   objects.map(object => object.properties.uri = '<' + object.id + '>');

    //   return objects;
    // });
  }

}