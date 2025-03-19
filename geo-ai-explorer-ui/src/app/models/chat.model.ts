import { GeoObject } from "./geoobject.model";

export interface ChatMessage {
  id: string
  sender: 'user' | 'system';
  text: string;
  mappable: boolean;
}

export interface ServerChatResponse {
  content: string;
  sessionId: string;
  mappable: boolean;
}

export interface LocationPage {
  statement: string;
  locations: GeoObject[];
  limit: number;
  offset: number;
  count: number;
}