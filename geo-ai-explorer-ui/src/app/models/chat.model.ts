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