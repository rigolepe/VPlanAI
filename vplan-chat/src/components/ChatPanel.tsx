import React, { useState, useEffect, Dispatch } from 'react';
import ChatHistory from './ChatHistory';
import AgentSelector from './AgentSelector';
import DataSourceList from './DataSourceList';
import styles from './ChatPanel.module.css';
import { Agent } from '../types/agent';
import { ChatMessage } from '../types/chat';
import { sendMessageWithFunction } from '../services/api';
import { Entity } from '../types/entity';

interface ChatPanelProps {
  showAgentManager: boolean;
  toggleAgentManager: () => void;
  agents: Agent[];

  changeData:  (data: any) => void
  addEntities: (entities: Entity[]) => string
  jsonData: any
}

const ChatPanel: React.FC<ChatPanelProps> = ({ showAgentManager, toggleAgentManager, agents, jsonData, changeData, addEntities }) => {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (currentAgent && userMessage.trim()) {
      const newMessage: ChatMessage = {
        role: 'user',
        content: userMessage,
      };
      setChatHistory(prev => [...prev, newMessage]);
      setUserMessage('');
      setLoading(true);

      try {
        const response = await sendMessageWithFunction(currentAgent,  [...chatHistory, newMessage], '');
        const { assistantMessage, functionCall } = response;
        var functionDescription = ""
        if (functionCall?.description) {
          functionDescription = `\n\n${functionCall?.description}`
        }
        const messageContent = assistantMessage.content + functionDescription
        
        setChatHistory(prev => [...prev, {
            role: 'system',
            content: messageContent,
          } as ChatMessage
        ]);
        
        // Handle the function call from OpenAI, if present
        if (functionCall) {
          handleFunctionCall(functionCall);
        }

      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFunctionCall = async (functionCall: any) => {
    if (functionCall.name === 'getWeather') {
      const functionArgs = JSON.parse(functionCall.arguments);
      const weatherData = await getWeather(functionArgs.location); // Example function

      // Send the result of the function back to the chat
      const functionResult: ChatMessage = {
        role: 'agent',
        content: `The weather in ${functionArgs.location} is ${weatherData.temperature}°C with ${weatherData.description}.`,
      };
      setChatHistory(prev => [...prev, functionResult]);
    }

    if(functionCall.name === "removeElement"){
      const functionArgs = JSON.parse(functionCall.arguments);
      await removeElement(functionArgs.id); // Example function
    }

    if(functionCall.name === "addEntities"){
      const functionArgs = JSON.parse(functionCall.arguments);
      const entities: Entity[] = functionArgs as Entity[]
      const addResult = addEntities(entities)
      // Send the result of the function back to the chat
      const functionResult: ChatMessage = {
        role: 'agent',
        content: `The result of adding the entities is: ${addResult}.`,
      };
      setChatHistory(prev => [...prev, functionResult]);
    }

  };

  const removeElement = async( id: string) => {
    console.log("called function to delete element: ", id)
  }

  const getWeather = async (location: string) => {
    // This is a mock function to simulate getting weather data
    return {
      location,
      temperature: 25,
      description: 'sunny',
    };
  };

  useEffect(() => {
    if (currentAgent) {
      setChatHistory([]); // Clear chat when switching agents
    }
  }, [currentAgent]);

  return (
    <div className={styles.chatPanel}>
      <AgentSelector agents={agents} onSelectAgent={(agent) => setCurrentAgent(agent)} toggleAgentManager={toggleAgentManager} />
      <ChatHistory history={chatHistory} />
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type your message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      <DataSourceList changeData={changeData} jsonData={jsonData} />
    </div>
  );
};

export default ChatPanel;
