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

export interface Location {
  type: string;
  code: string;
  label: string;
  geometry: any;
}
