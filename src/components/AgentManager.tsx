import React, { useState, useEffect } from 'react';
import { Agent } from '../types/agent';
import styles from './AgentManager.module.css';

interface AgentManagerProps {
  agents: Agent[];
  onSave: (agent: Agent) => void;
  onDelete: (agentId: string) => void;
  onClose: () => void;
}

const AgentManager: React.FC<AgentManagerProps> = ({ agents, onSave, onDelete, onClose }) => {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [agentsPerPage] = useState(5);

  useEffect(() => {
    if (editingAgent) {
      validateForm(editingAgent);
    }
  }, [editingAgent]);

  const validateForm = (agent: Agent) => {
    const newErrors: { [key: string]: string } = {};
    if (!agent.name.trim()) newErrors.name = 'Name is required';
    if (!agent.apiUrl.trim()) newErrors.apiUrl = 'API URL is required';
    if (!isValidUrl(agent.apiUrl)) newErrors.apiUrl = 'Invalid URL format';
    if (agent.apiKey && !isValidApiKey(agent.apiKey)) newErrors.apiKey = 'Invalid API key format';
    if (!agent.systemPrompt.trim()) newErrors.systemPrompt = 'System Prompt is required';
    setErrors(newErrors);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidApiKey = (apiKey: string) => {
    // Implement your API key validation logic here
    return apiKey.length > 8; // Example: API key must be longer than 8 characters
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingAgent) {
      const updatedAgent = { ...editingAgent, [e.target.name]: e.target.value };
      setEditingAgent(updatedAgent);
      validateForm(updatedAgent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent && Object.keys(errors).length === 0) {
      onSave(editingAgent);
      setSuccessMessage('Agent saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingAgent(null);
    }
  };

  const handleDelete = (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      onDelete(agentId);
      setSuccessMessage('Agent deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleCancel = () => {
    if (editingAgent && Object.keys(editingAgent).some(key => editingAgent[key as keyof Agent] !== '')) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        setEditingAgent(null);
      }
    } else {
      setEditingAgent(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortedAgents = [...agents].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  // Get current agents
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = sortedAgents.slice(indexOfFirstAgent, indexOfLastAgent);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={styles.agentManager} data-testid="agent-manager">
      <h2>Manage Agents</h2>
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      <button onClick={toggleSortOrder} data-testid="sort-button">
        Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
      </button>
      <ul className={styles.agentList}>
        {currentAgents.map(agent => (
          <li key={agent.id} className={styles.agentItem}>
            <span>{agent.name}</span>
            <div className={styles.agentActions}>
              <button onClick={() => setEditingAgent(agent)} className={styles.editButton} data-testid={`edit-agent-${agent.id}`}>Edit</button>
              <button onClick={() => handleDelete(agent.id)} className={styles.deleteButton} data-testid={`delete-agent-${agent.id}`}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <div className={styles.pagination}>
        {Array.from({ length: Math.ceil(agents.length / agentsPerPage) }, (_, i) => (
          <button key={i} onClick={() => paginate(i + 1)} className={currentPage === i + 1 ? styles.activePage : ''}>
            {i + 1}
          </button>
        ))}
      </div>
      <button onClick={() => setEditingAgent({ id: '', name: '', apiUrl: '', systemPrompt: '' })} className={styles.addButton} data-testid="add-agent-button">Add New Agent</button>
      
      {editingAgent && (
        <form onSubmit={handleSubmit} className={styles.agentForm}>
          <div className={styles.formField}>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              value={editingAgent.name}
              onChange={handleInputChange}
              placeholder="Agent Name"
              required
              data-testid="agent-name-input"
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="apiUrl">API URL:</label>
            <input
              id="apiUrl"
              name="apiUrl"
              value={editingAgent.apiUrl}
              onChange={handleInputChange}
              placeholder="API URL"
              required
              data-testid="agent-api-url-input"
            />
            {errors.apiUrl && <span className={styles.error}>{errors.apiUrl}</span>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="apiKey">API Key (optional):</label>
            <input
              id="apiKey"
              name="apiKey"
              value={editingAgent.apiKey || ''}
              onChange={handleInputChange}
              placeholder="API Key"
              data-testid="agent-api-key-input"
            />
            {errors.apiKey && <span className={styles.error}>{errors.apiKey}</span>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="systemPrompt">System Prompt:</label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              value={editingAgent.systemPrompt}
              onChange={handleInputChange}
              placeholder="System Prompt"
              required
              data-testid="agent-system-prompt-input"
            />
            {errors.systemPrompt && <span className={styles.error}>{errors.systemPrompt}</span>}
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={Object.keys(errors).length > 0} className={styles.saveButton} data-testid="save-agent-button">Save</button>
            <button type="button" onClick={handleCancel} className={styles.cancelButton} data-testid="cancel-edit-button">Cancel</button>
          </div>
        </form>
      )}
      
      <button onClick={onClose} className={styles.closeButton} data-testid="close-agent-manager-button">Close</button>
    </div>
  );
};

export default AgentManager;