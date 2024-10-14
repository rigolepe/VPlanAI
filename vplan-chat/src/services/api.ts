import axios from 'axios';
import { Agent } from '../types/agent';
import { ChatMessage } from '../types/chat';

export const sendMessageWithFunction = async (agent: Agent, messages: ChatMessage[], context: string): Promise<{ assistantMessage: ChatMessage; functionCall?: any }> => {
  try { 
    const response = await axios.post(`${agent.apiUrl}`, {
      model: "gpt-3.5-turbo",
      messages: messages,
      functions: [
        {
          name: "removeElement",
          description: "Remove an element from the main array of the json by ID",
          parameters: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Id of a json element to delete, example: 808C814"
              }
            },
            required: ["id"]
          }
        }
      ],
      function_call: "auto", // This will automatically call the function if needed
    }, {
      headers: {
        'api-key': `${agent.apiKey}`,
      },
    });

    const assistantMessage: ChatMessage = {
      role: 'agent',
      content: response.data.choices[0].message.content || '',
    };

    const functionCall = response.data.choices[0].message.function_call;

    return { assistantMessage, functionCall };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
