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

  useEffect(() => {
    if (editingAgent) {
      validateForm(editingAgent);
    }
  }, [editingAgent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingAgent) {
      const updatedAgent = { ...editingAgent, [e.target.name]: e.target.value };
      setEditingAgent(updatedAgent);
      validateForm(updatedAgent);
    }
  };

  const validateForm = (agent: Agent) => {
    const newErrors: { [key: string]: string } = {};
    if (!agent.name.trim()) newErrors.name = 'Name is required';
    if (!agent.apiUrl.trim()) newErrors.apiUrl = 'API URL is required';
    if (!agent.systemPrompt.trim()) newErrors.systemPrompt = 'System Prompt is required';
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent && Object.keys(errors).length === 0) {
      onSave(editingAgent);
      setEditingAgent(null);
    }
  };

  const handleDelete = (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      onDelete(agentId);
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

  return (
    <div className={styles.agentManager}>
      <h2>Manage Agents</h2>
      <ul className={styles.agentList}>
        {agents.map(agent => (
          <li key={agent.id} className={styles.agentItem}>
            <span>{agent.name}</span>
            <div className={styles.agentActions}>
              <button onClick={() => setEditingAgent(agent)} className={styles.editButton}>Edit</button>
              <button onClick={() => handleDelete(agent.id)} className={styles.deleteButton}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => setEditingAgent({ id: '', name: '', apiUrl: '', systemPrompt: '' })} className={styles.addButton}>Add New Agent</button>
      
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
            />
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
            />
            {errors.systemPrompt && <span className={styles.error}>{errors.systemPrompt}</span>}
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={Object.keys(errors).length > 0} className={styles.saveButton}>Save</button>
            <button type="button" onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      )}
      
      <button onClick={onClose} className={styles.closeButton}>Close</button>
    </div>
  );
};

export default AgentManager;