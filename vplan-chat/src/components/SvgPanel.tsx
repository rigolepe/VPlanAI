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