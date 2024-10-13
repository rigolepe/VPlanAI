import React, { useEffect, useState } from 'react';
import styles from './SvgPanel.module.css';


// Define the interface for the entities based on the JSON schema
interface Coordinates2D extends Array<number> {
  0: number; // X-coordinate
  1: number; // Y-coordinate
}

interface Entity {
  id: string;
  layer: string;
  type: string;
  coordinates: Coordinates2D[] | Coordinates2D;
  radius?: number;
  start_angle?: number;
  end_angle?: number;
  is_closed?: boolean;
  text?: string;
  height?: number;
  color?: number;
  [key: string]: any; // Extendable for other properties
}

interface Insert extends Entity {
  name: string; // Block name
  attribs?: any[]; // Inserted attributes (ignored for now)
}

interface Block {
  id: string;
  block_name: string;
  entities: Entity[];
}

interface SvgPanelProps {
  jsonData: Entity[]; // Expects the JSON data to adhere to the given schema
}

// Helper function to group entities by layer
function groupByLayer(entities: Entity[]): { [layer: string]: Entity[] } {
  return entities.reduce((acc, entity) => {
    if (!acc[entity.layer]) {
      acc[entity.layer] = [];
    }
    acc[entity.layer].push(entity);
    return acc;
  }, {} as { [layer: string]: Entity[] });
}

// React component for rendering the dynamic SVG
const SvgPanel: React.FC<SvgPanelProps> = ({ jsonData }) => {
  const [layers, setLayers] = useState<{ [layer: string]: Entity[] }>({});
  const [blocks, setBlocks] = useState<{ [blockName: string]: Entity[] }>({});
  const [inVisibleLayers, setInvisibleLayers] = useState<string[]>([])

  // Load the JSON data and group by layers
  useEffect(() => {
    const blockDefinitions: { [blockName: string]: Entity[] } = {};
    const topLevelEntities: Entity[] = [];

    // Separate blocks from top-level entities
    for (const entity of jsonData) {
      if (entity.type === 'BLOCK') {
        const blockEntity = entity as unknown as Block;
        blockDefinitions[blockEntity.block_name] = blockEntity.entities;
      } else {
        topLevelEntities.push(entity);
      }
    }

    setBlocks(blockDefinitions); // Store the blocks for later use in inserts
    setLayers(groupByLayer(topLevelEntities)); // Group non-block entities by layer
  }, [jsonData]);

  // Helper function to transform points (scaling, rotation, and translation)
  const transformPoint = (
    point: Coordinates2D,
    scale: [number, number] = [1, 1],
    rotation: number = 0,
    translation: [number, number] = [0, 0]
  ): Coordinates2D => {
    const [scaleX, scaleY] = scale;
    const [translateX, translateY] = translation;
    const angleRad = rotation * (Math.PI / 180);
    const x = point[0] * scaleX;
    const y = point[1] * scaleY;

    // Rotation
    const xRot = x * Math.cos(angleRad) - y * Math.sin(angleRad);
    const yRot = x * Math.sin(angleRad) + y * Math.cos(angleRad);

    // Translation
    return [xRot + translateX, yRot + translateY];
  };

  // Drawing functions for each type of entity
  const renderEntity = (entity: Entity, key: number, transform?: any) => {
    switch (entity.type) {
      case 'POINT': {
        const [x, y] = entity.coordinates as Coordinates2D;
        return <circle key={key} cx={x} cy={y} r={2} fill="black" />;
      }
      case 'LINE': {
        const [start, end] = entity.coordinates as Coordinates2D[];
        return (
          <line
            key={key}
            x1={start[0]}
            y1={start[1]}
            x2={end[0]}
            y2={end[1]}
            stroke="black"
            strokeWidth="1"
          />
        );
      }
      case 'POLYLINE': {
        const points = (entity.coordinates as Coordinates2D[])
          .map((coord) => coord.join(','))
          .join(' ');
        return (
          <polyline
            key={key}
            points={points}
            fill="none"
            stroke="black"
            strokeWidth="1"
            style={{ fill: entity.is_closed ? 'none' : undefined }}
          />
        );
      }
      case 'CIRCLE': {
        const [cx, cy] = entity.coordinates as Coordinates2D;
        return (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={entity.radius}
            stroke="black"
            fill="none"
            strokeWidth="1"
          />
        );
      }
      case 'ARC': {
        const [cx, cy] = entity.coordinates as Coordinates2D;
        const { radius, start_angle, end_angle } = entity;
        // Rendering the arc is more complex and would involve path creation based on angles.
        return (
          <path
            key={key}
            d={`M ${cx},${cy} A ${radius},${radius} ${start_angle},${end_angle}`}
            stroke="black"
            fill="none"
          />
        );
      }
      case 'TEXT': {
        const [x, y] = entity.coordinates as Coordinates2D;
        return (
          <text key={key} x={x} y={y} fontSize={entity.height} fill="black">
            {entity.text}
          </text>
        );
      }
      default:
        return null;
    }
  };

  // Render a block entity, using the coordinates of the insert
  const renderInsert = (insert: Insert, key: number) => {
    const blockEntities = blocks[insert.name];
    if (!blockEntities) return null;

    return (
      <g key={key}>
        {blockEntities.map((entity, index) =>
          renderEntity(entity, index, {
            scale: [1, 1],
            rotation: 0,
            translation: insert.coordinates as Coordinates2D,
          })
        )}
      </g>
    );
  };

  const toggleLayer = (name: string) => {
    if (inVisibleLayers.includes(name)) setInvisibleLayers(inVisibleLayers.filter(layer => layer !== name))
    else setInvisibleLayers([...inVisibleLayers, name])
  };

  return (
    <div className={styles.svgPanel}>
      <div className={styles.sidebar}>
        {Object.keys(layers).map((layerName, layerIndex) => (
          <button
            key={layerName}
            onClick={() => toggleLayer(layerName)}
            className={!inVisibleLayers.includes(layerName) ? styles.active : ''}
          >
            {layerName}
          </button>
        ))}
      </div>
      <div className={styles.svgContainer}>
        <svg width="100%" height="100%">
          {Object.keys(layers).map((layerName, layerIndex) => (
            <g key={layerIndex} id={layerName}>
              {layers[layerName].map((entity, entityIndex) => {
                if (entity.type === 'INSERT') {
                  return renderInsert(entity as Insert, entityIndex);
                }
                return renderEntity(entity, entityIndex);
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );

};

export default SvgPanel;
