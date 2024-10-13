# Folder Scan: .

## vplan-chat/README.md

```
# VPlan Chat

VPlan Chat is a TypeScript + React web application that combines SVG visualization with LLM-powered chat functionality. The application is designed to provide an interactive interface for viewing and manipulating SVG images while engaging in AI-assisted conversations.

## Features

### SVG Panel
- Displays an SVG image with multiple layers
- Left sidebar with toggle buttons for each SVG layer
- Zoom in/out functionality using mouse scroll
- Panning when zoomed in beyond image edges

### Chat Panel
- LLM chat client supporting multiple chat histories
- Multiple reusable agents (stored system prompts for LLM interaction)
- Interface for adding and editing agents
- Agent configuration includes name, LLM API URL, user key, and system prompt
- Programmatic chat context management
- Support for function calling

### Data Management
- Load and store JSON data in the browser's local storage
- List data sources with toggle buttons for including in chat context
- Select data source for SVG rendering

### Layout
- Two main panels divided by a sliding edge
- Responsive design for various screen sizes

## Technical Stack
- Frontend: TypeScript, React
- Backend: TypeScript, Node.js
- State Management: React Context API and hooks
- Styling: CSS Modules
- SVG Manipulation: Custom React components
- Chat Functionality: Integration with external LLM APIs

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `src/`: Contains all the frontend source code
  - `components/`: React components
  - `services/`: API and data management services
  - `hooks/`: Custom React hooks
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions
- `server/`: Contains the backend source code
- `public/`: Static assets

## Next steps

1 Implement the sliding edge between SVG and Chat panels.
2 Add zoom and pan functionality to the SVG viewer.
3 Implement the agent management interface (adding, editing agents).
4 Create the JSON data source loading and management system.
5 Implement the actual LLM API calls and function calling framework.
6 Add more detailed styling and responsiveness.
7 Implement proper error handling and loading states.
8 Set up proper state management for chat histories.
9 Implement the SVG rendering logic based on the selected data source.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project has a proprietary license.

```

## vplan-chat/package.json

```
{
  "name": "vplan-chat",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^16.18.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "axios": "^0.27.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

## vplan-chat/tsconfig.json

```
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

## vplan-chat/server/index.ts

```
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/chat', (req, res) => {
  // Implement chat functionality
  // This is a placeholder for the actual implementation
  res.json({ message: 'Chat endpoint reached' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## vplan-chat/public/index.html

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="VPlan Chat - SVG Visualization and LLM Chat Application"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>VPlan Chat</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

## vplan-chat/src/index.tsx

```
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## vplan-chat/src/App.tsx

```
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
```

## vplan-chat/src/App.css

```
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}

```

## vplan-chat/src/index.css

```
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

```

## vplan-chat/src/types/agent.ts

```
export interface Agent {
  id: string;
  name: string;
  apiUrl: string;
  apiKey?: string;
  systemPrompt: string;
}
```

## vplan-chat/src/types/chat.ts

```
export interface ChatMessage {
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  agentId: string;
  messages: ChatMessage[];
}
```

## vplan-chat/src/types/dataSource.ts

```
export interface DataSource {
  id: string;
  name: string;
  data: any; // This could be more specific depending on your data structure
  includeInContext: boolean;
}
```

## vplan-chat/src/types/css.d.ts

```
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

## vplan-chat/src/utils/svgUtils.ts

```
// This file will contain utility functions for SVG manipulation
// For now, it's a placeholder for future implementation

export const zoomSvg = (scale: number) => {
  // Implement zoom functionality
};

export const panSvg = (dx: number, dy: number) => {
  // Implement pan functionality
};

export const renderSvgLayer = (layerId: string, visible: boolean) => {
  // Implement layer rendering
};

// Add more SVG utility functions as needed
```

## vplan-chat/src/components/AgentManager.module.css

```
/* AgentManager.module.css */

.agentManager {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.agentList {
  list-style-type: none;
  padding: 0;
}

.agentItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.agentActions {
  display: flex;
  gap: 10px;
}

.editButton,
.deleteButton,
.addButton,
.saveButton,
.cancelButton,
.closeButton {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.editButton {
  background-color: #4CAF50;
  color: white;
}

.deleteButton {
  background-color: #f44336;
  color: white;
}

.addButton {
  background-color: #2196F3;
  color: white;
  margin-top: 10px;
}

.agentForm {
  margin-top: 20px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.formField {
  margin-bottom: 15px;
}

.formField label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.formField input,
.formField textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.formField textarea {
  height: 100px;
  resize: vertical;
}

.error {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
}

.formActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.saveButton {
  background-color: #4CAF50;
  color: white;
}

.saveButton:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.cancelButton {
  background-color: #f44336;
  color: white;
}

.closeButton {
  background-color: #607D8B;
  color: white;
  margin-top: 20px;
}

.editButton:hover,
.deleteButton:hover,
.addButton:hover,
.saveButton:hover,
.cancelButton:hover,
.closeButton:hover {
  opacity: 0.9;
}
```

## vplan-chat/src/components/ChatPanel.module.css

```
.chatPanel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.inputArea {
  display: flex;
  margin-top: 1rem;
}

.inputArea input {
  flex-grow: 1;
  padding: 0.5rem;
  margin-right: 0.5rem;
}

.inputArea button {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
}

.inputArea button:hover {
  background-color: #218838;
}
```

## vplan-chat/src/components/ChatHistory.module.css

```
.chatHistory {
  height: 700px;
  overflow-y: auto;
 
  padding: 1rem;
  margin-bottom: 1rem;
}

.message {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.user {
  background-color: #f0f0f0;
  text-align: right;
}

.agent {
  background-color: #e6f2ff;
}

.sender {
  font-weight: bold;
  margin-right: 0.5rem;
}
```

## vplan-chat/src/components/SvgPanel.module.css

```
.svgPanel {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 70px;
  background-color: #f0f0f0;
  padding: 1rem;
  overflow-y: auto;
}

.sidebar button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #fff;
  border: 1px solid #ccc;
  cursor: pointer;
}

.sidebar button.active {
  background-color: #007bff;
  color: white;
}

.svgContainer {
  flex-grow: 1;
  overflow: hidden;
}

.svgContainer svg {
  width: 100%;
  height: 100%;
}
```

## vplan-chat/src/components/MainLayout.tsx

```
import React, { useState } from 'react';
import SvgPanel from './SvgPanel';
import ChatPanel from './ChatPanel';
import styles from './MainLayout.module.css';
import { Agent } from '../types/agent';

interface MainLayoutProps {
  showAgentManager: boolean;
  toggleAgentManager: () => void;
  agents: Agent[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ showAgentManager, toggleAgentManager, agents }) => {
  const [splitPosition, setSplitPosition] = useState(50);

  const handleSplitDrag = (e: React.MouseEvent) => {
    // Implement split dragging logic here
  };

  return (
    <div className={styles.mainLayout}>
      <div className={styles.svgPanel} style={{ width: `${splitPosition}%` }}>
        <SvgPanel />
      </div>
      <div className={styles.splitter} onMouseDown={handleSplitDrag}></div>
      <div className={styles.chatPanel} style={{ width: `${100 - splitPosition}%` }}>
        <ChatPanel showAgentManager={showAgentManager} toggleAgentManager={toggleAgentManager} agents={agents} />
      </div>
    </div>
  );
};

export default MainLayout;
```

## vplan-chat/src/components/AgentSelector.tsx

```
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

```

## vplan-chat/src/components/AgentSelector.module.css

```
.agentSelector {
  margin-bottom: 1rem;
}

.agentSelector select {
  margin-right: 1rem;
  padding: 0.5rem;
}

.agentSelector button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.agentSelector button:hover {
  background-color: #0056b3;
}
```

## vplan-chat/src/components/MainLayout.module.css

```
.mainLayout {
  display: flex;
  height: 100vh;
}

.svgPanel {
  flex-grow: 1;
  overflow: hidden;
}

.chatPanel {
  flex-grow: 1;
  overflow: hidden;
}

.splitter {
  width: 8px;
  background-color: #ccc;
  cursor: col-resize;
}

.splitter:hover {
  background-color: #999;
}
```

## vplan-chat/src/components/ChatHistory.tsx

```
import React from 'react';
import { ChatMessage } from '../types/chat';
import styles from './ChatHistory.module.css';

interface ChatHistoryProps {
  history: ChatMessage[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  return (
    <div className={styles.chatHistory}>
      {history.map((message, index) => (
        <div key={index} className={`${styles.message} ${styles[message.sender]}`}>
          <span className={styles.sender}>{message.sender}</span>
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
```

## vplan-chat/src/components/DataSourceList.tsx

```
import React, { useState, useEffect } from 'react';
import { DataSource } from '../types/dataSource';
import styles from './DataSourceList.module.css';

const DataSourceList: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [svgDataSource, setSvgDataSource] = useState<string | null>(null);

  useEffect(() => {
    // Load data sources from local storage
    // This is a placeholder for the actual implementation
    const loadedDataSources: DataSource[] = [
      { id: '1', name: 'Data Source 1', includeInContext: true, data: []  },
      { id: '2', name: 'Data Source 2', includeInContext: false, data: []  },
      // Add more data sources as needed
    ];
    setDataSources(loadedDataSources);
  }, []);

  const toggleIncludeInContext = (id: string) => {
    setDataSources(dataSources.map(ds =>
      ds.id === id ? { ...ds, includeInContext: !ds.includeInContext } : ds
    ));
  };

  const handleSvgDataSourceSelect = (id: string) => {
    setSvgDataSource(id === svgDataSource ? null : id);
  };

  return (
    <div className={styles.dataSourceList}>
      <h3>Data Sources</h3>
      {dataSources.map(ds => (
        <div key={ds.id} className={styles.dataSourceItem}>
          <span>{ds.name}</span>
          <label>
            <input
              type="checkbox"
              checked={ds.includeInContext}
              onChange={() => toggleIncludeInContext(ds.id)}
            />
            Include in Context
          </label>
          <label>
            <input
              type="radio"
              name="svgDataSource"
              checked={ds.id === svgDataSource}
              onChange={() => handleSvgDataSourceSelect(ds.id)}
            />
            Use for SVG
          </label>
        </div>
      ))}
      <button onClick={() => {/* Open modal to add new data source */}}>Add Data Source</button>
    </div>
  );
};

export default DataSourceList;
```

## vplan-chat/src/components/ChatPanel.tsx

```
import React, { useState, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import AgentSelector from './AgentSelector';
import DataSourceList from './DataSourceList';
import styles from './ChatPanel.module.css';
import { Agent } from '../types/agent';
import { ChatMessage } from '../types/chat';
import { sendMessageWithFunction } from '../services/api';

interface ChatPanelProps {
  showAgentManager: boolean;
  toggleAgentManager: () => void;
  agents: Agent[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ showAgentManager, toggleAgentManager, agents }) => {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (currentAgent && userMessage.trim()) {
      const newMessage: ChatMessage = {
        sender: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, newMessage]);
      setUserMessage('');
      setLoading(true);

      try {
        const response = await sendMessageWithFunction(currentAgent, userMessage, '');
        const { assistantMessage, functionCall } = response;

        setChatHistory(prev => [...prev, assistantMessage]);

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
        sender: 'agent',
        content: `The weather in ${functionArgs.location} is ${weatherData.temperature}°C with ${weatherData.description}.`,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, functionResult]);
    }
  };

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
      <DataSourceList />
    </div>
  );
};

export default ChatPanel;

```

## vplan-chat/src/components/SvgPanel.tsx

```
import React, { useState } from 'react';
import styles from './SvgPanel.module.css';

const SvgPanel: React.FC = () => {
  const [layers, setLayers] = useState([
    { id: 1, name: 'Layer 1', visible: true },
    { id: 2, name: 'Layer 2', visible: true },
    // Add more layers as needed
  ]);

  const toggleLayer = (id: number) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  return (
    <div className={styles.svgPanel}>
      <div className={styles.sidebar}>
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className={layer.visible ? styles.active : ''}
          >
            {layer.name}
          </button>
        ))}
      </div>
      <div className={styles.svgContainer}>
        {/* SVG rendering will be implemented here */}
        <svg width="100%" height="100%">
          {/* SVG content will be added dynamically */}
        </svg>
      </div>
    </div>
  );
};

export default SvgPanel;
```

## vplan-chat/src/components/AgentManager.tsx

```
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
```

## vplan-chat/src/components/DataSourceList.module.css

```
.dataSourceList {
  height: 200px;
  margin-bottom: 1rem;
}

.dataSourceItem {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dataSourceItem span {
  margin-right: 1rem;
}

.dataSourceItem label {
  margin-right: 1rem;
}

.dataSourceList button {
  padding: 0.5rem 1rem;
  background-color: #17a2b8;
  color: white;
  border: none;
  cursor: pointer;
}

.dataSourceList button:hover {
  background-color: #138496;
}
```

## vplan-chat/src/hooks/useLocalStorage.ts

```
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
```

## vplan-chat/src/services/api.ts

```
import axios from 'axios';
import { Agent } from '../types/agent';
import { ChatMessage } from '../types/chat';

export const sendMessageWithFunction = async (agent: Agent, message: string, context: string): Promise<{ assistantMessage: ChatMessage; functionCall?: any }> => {
  try { 
    const response = await axios.post(`${agent.apiUrl}`, {
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: message }
      ],
      functions: [
        {
          name: "getWeather",
          description: "Get the weather forecast for a specific location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g., 'San Francisco, CA'"
              }
            },
            required: ["location"]
          }
        }
      ],
      function_call: "auto", // This will automatically call the function if needed
    }, {
      headers: {
        'Authorization': `Bearer ${agent.apiKey}`,
      },
    });

    const assistantMessage: ChatMessage = {
      sender: 'agent',
      content: response.data.choices[0].message.content || '',
      timestamp: new Date(),
    };

    const functionCall = response.data.choices[0].message.function_call;

    return { assistantMessage, functionCall };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

```

