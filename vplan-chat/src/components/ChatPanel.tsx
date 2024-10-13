import React, { useState } from 'react';
import ChatHistory from './ChatHistory';
import AgentSelector from './AgentSelector';
import DataSourceList from './DataSourceList';
import styles from './ChatPanel.module.css';
import { Agent } from '../types/agent';

interface ChatPanelProps {
  showAgentManager: boolean;
  toggleAgentManager: () => void;
  agents: Agent[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ showAgentManager, toggleAgentManager, agents }) => {
  
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = (message: string) => {
    // Implement sending message logic here
  };

  return (
    <div className={styles.chatPanel}>
      <AgentSelector agents={agents} onSelectAgent={(agent) => setCurrentAgent(agent)} toggleAgentManager={toggleAgentManager} />
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