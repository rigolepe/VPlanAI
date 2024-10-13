import axios from 'axios';
import { Agent } from '../types/agent';
import { ChatMessage } from '../types/chat';

export const sendMessageWithFunction = async (agent: Agent, message: string, context: string): Promise<{ assistantMessage: ChatMessage; functionCall?: any }> => {
  try { 
    const response = await axios.post(`${agent.apiUrl}`, {
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: message }
      ],
      functions: [
        {
          name: "getWeather",
          description: "Get the weather forecast for a specific location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g., 'San Francisco, CA'"
              }
            },
            required: ["location"]
          }
        }
      ],
      function_call: "auto", // This will automatically call the function if needed
    }, {
      headers: {
        'Authorization': `Bearer ${agent.apiKey}`,
      },
    });

    const assistantMessage: ChatMessage = {
      sender: 'agent',
      content: response.data.choices[0].message.content || '',
      timestamp: new Date(),
    };

    const functionCall = response.data.choices[0].message.function_call;

    return { assistantMessage, functionCall };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
