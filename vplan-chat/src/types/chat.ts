export interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
}

export interface ChatHistory {
  id: string;
  agentId: string;
  messages: ChatMessage[];
}