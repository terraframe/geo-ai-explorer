import { GeoObject } from "./geoobject.model";

export interface MessageSection {
  text: string;
  type: number;
  uri?: string;
}


export interface ChatMessage {
  id: string
  sender: 'user' | 'system';
  text: string;
  mappable: boolean;
  ambiguous?: boolean;
  sections?: MessageSection[];
  loading?: boolean;
  purpose: 'info' | 'standard'
}

export interface ServerChatResponse {
  content: string;
  sessionId: string;
  mappable: boolean;
  ambiguous: boolean;
}

export interface LocationPage {
  statement: string;
  locations: GeoObject[];
  limit: number;
  offset: number;
  count: number;
}