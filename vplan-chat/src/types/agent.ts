export interface Agent {
  id: string;
  name: string;
  apiUrl: string;
  apiKey?: string;
  systemPrompt: string;
}