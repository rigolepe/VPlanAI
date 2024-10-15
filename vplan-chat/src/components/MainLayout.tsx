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
  const [splitPosition, setSplitPosition] = useState(50); // Default position: 50% split
  const [jsonData, setJsonData] = useState<any>({});
  const [isDragging, setIsDragging] = useState(false); // To track if the user is dragging

  const handleSplitDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate new split position based on mouse position
    const newSplitPosition = (e.clientX / window.innerWidth) * 100;
    
    if (newSplitPosition > 10 && newSplitPosition < 90) {
      setSplitPosition(newSplitPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const changeData = (data: any) => {
    console.log('setting data: ', data);
    setJsonData(data);
  };

  return (
    <div className={styles.mainLayout}>
      <div className={styles.svgPanel} style={{ width: `${splitPosition}%` }}>
        <SvgPanel jsonData={jsonData} />
      </div>
      <div className={styles.splitter} onMouseDown={handleSplitDrag}></div>
      <div className={styles.chatPanel} style={{ width: `${100 - splitPosition}%` }}>
        <ChatPanel
          showAgentManager={showAgentManager}
          toggleAgentManager={toggleAgentManager}
          agents={agents}
          jsonData={jsonData}
          changeData={changeData}
        />
      </div>
    </div>
  );
};

export default MainLayout;
