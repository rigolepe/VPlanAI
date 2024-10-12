import React, { useState, useEffect } from 'react';
import { Agent } from '../types/agent';
import styles from './AgentSelector.module.css';

interface AgentSelectorProps {
  onSelectAgent: (agent: Agent  | null) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ onSelectAgent }) => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    // Load agents from storage or API
    // This is a placeholder for the actual implementation
    const loadedAgents: Agent[] = [
      { id: '1', name: 'Default Agent', apiUrl: 'https://api.example.com', systemPrompt: 'You are a helpful assistant.' },
      // Add more agents as needed
    ];
    setAgents(loadedAgents);
  }, []);

  const handleAgentSelect = (agent: Agent | null) => {
    onSelectAgent(agent);
  };

  return (
    <div className={styles.agentSelector}>
      <h3>Select an Agent</h3>
      <select onChange={(e) => handleAgentSelect(agents.find(a => a.id === e.target.value) || null)}>
        {agents.map(agent => (
          <option key={agent.id} value={agent.id}>{agent.name}</option>
        ))}
      </select>
      <button onClick={() => {/* Open modal to add/edit agent */}}>Manage Agents</button>
    </div>
  );
};

export default AgentSelector;