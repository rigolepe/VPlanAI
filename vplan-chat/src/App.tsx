import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import AgentManager from './components/AgentManager';
import { Agent } from './types/agent';
import useLocalStorage from './hooks/useLocalStorage';
import './App.css';

function App() {
  const [showAgentManager, setShowAgentManager] = useState(false);
  const [agents, setAgents] = useLocalStorage<Agent[]>('agents', []);

  const toggleAgentManager = () => {
    setShowAgentManager(!showAgentManager);
  };

  const handleSaveAgent = (agent: Agent) => {
    const updatedAgents = agents.some(a => a.id === agent.id)
      ? agents.map(a => a.id === agent.id ? agent : a)
      : [...agents, { ...agent, id: Date.now().toString() }];
    setAgents(updatedAgents);
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter(a => a.id !== agentId));
  };

  return (
    <div className="App">
      <MainLayout
        showAgentManager={showAgentManager}
        toggleAgentManager={toggleAgentManager}
        agents={agents}
      />
      {showAgentManager && (
        <AgentManager
          agents={agents}
          onSave={handleSaveAgent}
          onDelete={handleDeleteAgent}
          onClose={toggleAgentManager}
        />
      )}
    </div>
  );
}

export default App;