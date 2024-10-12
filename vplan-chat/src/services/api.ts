import axios from 'axios';
import { Agent } from '../types/agent';
import { ChatMessage } from '../types/chat';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export const sendMessage = async (agent: Agent, message: string, context: string): Promise<ChatMessage> => {
  try {
    const response = await axios.post(`${agent.apiUrl}/chat`, {
      message,
      context,
      systemPrompt: agent.systemPrompt,
    }, {
      headers: {
        'Authorization': `Bearer ${agent.apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Add more API functions as needed for managing agents, data sources, etc.