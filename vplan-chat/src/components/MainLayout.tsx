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
  const [jsonData, setJsonData] = useState([])

  const handleSplitDrag = (e: React.MouseEvent) => {
    // Implement split dragging logic here
  };

  return (
    <div className={styles.mainLayout}>
      <div className={styles.svgPanel} style={{ width: `${splitPosition}%` }}>
        <SvgPanel jsonData={jsonData} />
      </div>
      <div className={styles.splitter} onMouseDown={handleSplitDrag}></div>
      <div className={styles.chatPanel} style={{ width: `${100 - splitPosition}%` }}>
        <ChatPanel showAgentManager={showAgentManager} toggleAgentManager={toggleAgentManager} agents={agents} />
      </div>
    </div>
  );
};

export default MainLayout;