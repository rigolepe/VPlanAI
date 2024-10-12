import React, { useState } from 'react';
import ChatHistory from './ChatHistory';
import AgentSelector from './AgentSelector';
import DataSourceList from './DataSourceList';
import styles from './ChatPanel.module.css';
import { Agent } from '../types/agent';

const ChatPanel: React.FC = () => {
  
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = (message: string) => {
    // Implement sending message logic here
  };

  return (
    <div className={styles.chatPanel}>
      <AgentSelector onSelectAgent={(agent) => setCurrentAgent(agent)} />
      <ChatHistory history={chatHistory} />
      <DataSourceList />
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e.currentTarget.value)}
        />
        <button onClick={() => handleSendMessage('Send')}>Send</button>
      </div>
    </div>
  );
};

export default ChatPanel;