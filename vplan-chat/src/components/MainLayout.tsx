import React, { useState } from 'react';
import SvgPanel from './SvgPanel';
import ChatPanel from './ChatPanel';
import styles from './MainLayout.module.css';

const MainLayout: React.FC = () => {
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
        <ChatPanel />
      </div>
    </div>
  );
};

export default MainLayout;