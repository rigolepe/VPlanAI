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
          description: "Removing an element from the main array of the json by ID",
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
        },
        {
          name: "addEntities",
          description: "Adding one or more elements to the dataset. This draws the new entities on the user's canvas.",
          parameters: {
            type: "object",
            properties: {
              entities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    layer: {
                      type: "string",
                      description: "The name of the layer in which the entity will be added and drawn."
                    },
                    type: {
                      type: "string",
                      description: "The type of the entity.",
                      enum: ["POLYLINE", "CIRCLE", "TEXT"]
                    },
                    coordinates: {
                      oneOf: [
                        {
                          type: "array",
                          items: {
                            type: "number"
                          }
                        },
                        {
                          type: "array",
                          items: {
                            type: "array",
                            items: {
                              type: "number"
                            }
                          }
                        }
                      ],
                      description: "Coordinates can be an array of numbers or an array of arrays of numbers."
                    },
                    radius: {
                      type: "number",
                      description: "The radius of the circle. Is only relevant to draw circles."
                    },
                    strokeWidth: {
                      type: "number",
                      description: "The stroke width the entity will be drawn in. The default is 0.1, medium width is 0.2 and bold is 0.3"
                    },
                    color: {
                      type: "number",
                      description: "A color coded in the AutoCAD Color Index (ACI)"
                    },
                    text: {
                      type: "string",
                      description: "The text to print on the drawing."
                    },
                    height: {
                      type: "number",
                      description: "The height of the text. A default height is 1.0"
                    }
                  },
                  required: ["layer", "type", "coordinates"]
                }
              }
            }
          }
        }
      ],
      function_call: "auto", // This will automatically call the function if needed
    }, {
      headers: {
        'api-key': `${agent.apiKey}`,
        'Authorization': `Bearer ${agent.apiKey}`,
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
