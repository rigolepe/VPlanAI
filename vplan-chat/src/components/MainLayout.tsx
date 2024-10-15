import React, { useState } from 'react';
import SvgPanel from './SvgPanel';
import ChatPanel from './ChatPanel';
import styles from './MainLayout.module.css';
import { Agent } from '../types/agent';
import { Entity } from '../types/entity';

interface MainLayoutProps {
  showAgentManager: boolean;
  toggleAgentManager: () => void;
  agents: Agent[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ showAgentManager, toggleAgentManager, agents }) => {
  const [splitPosition, setSplitPosition] = useState(50); // Default position: 50% split
  const [jsonData, setJsonData] = useState<Entity[]>([]);
  const [filteredJsonData, setFilteredJsonData] = useState<Entity[]>([]);
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

  const changeData = (data: any) => { // if this function is called, a new json is uploaded
    const entities = data as Entity[]
    setFilteredJsonData(entities);
    setJsonData(entities);
  };

  const addEntities = (entities: Entity[]) => {
    console.log(`adding ${entities.length} entities`)
    if (jsonData && Array.isArray(jsonData)) {
      const data = jsonData as Entity[]
      setJsonData([...data, ...entities])
    } else {
      setJsonData(entities)
    }
    return `${entities.length} entities added to the dataset and drawing.`
  }

  const changeFilteredJson = (data: Entity[]) => {
    setFilteredJsonData(data)
  }

  return (
    <div className={styles.mainLayout}>
      <div className={styles.svgPanel} style={{ width: `${splitPosition}%` }}>
        <SvgPanel jsonData={jsonData} changeFilteredJson={changeFilteredJson} />
      </div>
      <div className={styles.splitter} onMouseDown={handleSplitDrag}></div>
      <div className={styles.chatPanel} style={{ width: `${100 - splitPosition}%` }}>
        <ChatPanel
          showAgentManager={showAgentManager}
          toggleAgentManager={toggleAgentManager}
          agents={agents}
          jsonData={jsonData}
          filteredJsonData={filteredJsonData}
          changeData={changeData}
          addEntities={addEntities}
        />
      </div>
    </div>
  );
};

export default MainLayout;
