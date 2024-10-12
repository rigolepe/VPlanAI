export interface ChatMessage {
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  agentId: string;
  messages: ChatMessage[];
}