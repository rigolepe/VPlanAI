import React from 'react';
import { Agent } from '../types/agent';
import styles from './AgentSelector.module.css';

interface AgentSelectorProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent | null) => void;
  toggleAgentManager: () => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ agents, onSelectAgent, toggleAgentManager }) => {
  const handleAgentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAgent = agents.find(a => a.id === e.target.value) || null;
    onSelectAgent(selectedAgent);
  };

  return (
    <div className={styles.agentSelector}>
      <h3>Select an Agent</h3>
      <select onChange={handleAgentSelect}>
        <option value="">Select Agent</option>
        {agents.map(agent => (
          <option key={agent.id} value={agent.id}>{agent.name}</option>
        ))}
      </select>
      <button onClick={toggleAgentManager}>Manage Agents</button>
    </div>
  );
};

export default AgentSelector;
