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
  rotation?: number;
  xscale?: number;
  yscale?: number;
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

interface Transformation {
  scale: Coordinates2D,
  rotation: number,
  translation: Coordinates2D,
}

function getMinMaxCoordinates(entities: Entity[]) {
  var minX = 1000000000.0;
  var minY = 1000000000.0;
  var maxX = -1000000000.0;
  var maxY = -1000000000.0;

  function updateMinMax(coords: Coordinates2D) {
    minX = Math.min(minX, coords[0]);
    minY = Math.min(minY, coords[1]);
    maxX = Math.max(maxX, coords[0]);
    maxY = Math.max(maxY, coords[1]);
  }

  const concreteTypes = ['POINT', 'LINE', 'POLYLINE', 'SOLID', 'CIRCLE', 'ARC', 'TEXT'];
  const pointTypes = ['POINT', 'CIRCLE', 'ARC', 'TEXT'];
  const lineTypes = ['LINE', 'POLYLINE', 'SOLID'];
  if (entities.length > 0) {
    entities.forEach(entity => {
      if (concreteTypes.includes(entity.type)) {
        if (pointTypes.includes(entity.type)) {
          updateMinMax(entity.coordinates as Coordinates2D);
        } else if (lineTypes.includes(entity.type)) {
          (entity.coordinates as Coordinates2D[]).forEach(c => updateMinMax(c));
        }
      }
    })
  } else {
    minX = 0;
    minY = 0;
    maxX = 100;
    maxY = 100;
  }

  return [minX, minY, maxX, maxY];
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
  const [bounds, setBounds] = useState<number[]>([0, 0, 100, 100])
  const [width, setWidth] = useState<number>(100)
  const [height, setHeight] = useState<number>(100)

  // Load the JSON data and group by layers
  useEffect(() => {
    const blockDefinitions: { [blockName: string]: Entity[] } = {};
    const topLevelEntities: Entity[] = [];
    console.log(jsonData)
    if (jsonData && Array.isArray(jsonData)) {
      // Separate blocks from top-level entities
      for (const entity of jsonData) {
        if (entity.type === 'BLOCK') {
          const blockEntity = entity as unknown as Block;
          blockDefinitions[blockEntity.block_name] = blockEntity.entities;
        } else {
          topLevelEntities.push(entity);
        }
      }
    }

    setBlocks(blockDefinitions); // Store the blocks for later use in inserts
    setLayers(groupByLayer(topLevelEntities)); // Group non-block entities by layer
    const bounds = getMinMaxCoordinates(topLevelEntities)
    setBounds(bounds)
    const width = bounds[2] - bounds[0]; // max_x - min_x
    const height = bounds[3] - bounds[1]; // max_y - min_y
    setWidth(width)
    setHeight(height)
    console.log(`bounds: ${bounds}`)
    console.log(`width: ${width}, height: ${height}`)
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

  const toRadians = (angle: number): number => {
    return (angle * Math.PI) / 180.0
  }

  // Drawing functions for each type of entity
  const renderEntity = (entity: Entity, key: number) => {
    var rendering = null
    switch (entity.type) {
      case 'POINT': {
        const [x, y] = entity.coordinates as Coordinates2D;
        rendering = <circle key={key} cx={x} cy={y} r={2} fill="black" />
        break
      }
      case 'LINE': {
        const [start, end] = entity.coordinates as Coordinates2D[];
        rendering = (
          <line
            key={key}
            x1={start[0]}
            y1={start[1]}
            x2={end[0]}
            y2={end[1]}
            stroke="black"
            strokeWidth="1"
          />
        )
        break
      }
      case 'POLYLINE': {
        const points = (entity.coordinates as Coordinates2D[])
          .map((coord) => coord.join(','))
          .join(' ');
        rendering = (
          <polyline
            key={key}
            points={points}
            fill="none"
            stroke="black"
            strokeWidth="1"
            style={{ fill: entity.is_closed ? 'none' : undefined }}
          />
        )
        break
      }
      case 'CIRCLE': {
        const [x, y] = entity.coordinates as Coordinates2D;
        rendering = (
          <circle
            key={key}
            cx={x}
            cy={y}
            r={entity.radius}
            stroke="black"
            fill="none"
            strokeWidth="1"
          />
        )
        break
      }
      case 'ARC': {
        const [x, y] = entity.coordinates as Coordinates2D;
        const [radius, start_angle, end_angle] = [entity.radius!, entity.start_angle!, entity.end_angle!];
        const startX = x + radius * Math.cos(toRadians(start_angle))
        const startY = y + radius * Math.sin(toRadians(start_angle))
        const endX = x + radius * Math.cos(toRadians(end_angle))
        const endY = y + radius * Math.sin(toRadians(end_angle))

        const large_arc_flag = (end_angle - start_angle) > 180 ? 1 : 0;

        rendering = (
          <path
            key={key}
            d={`M ${startX},${startY} A ${radius},${radius} 0 ${large_arc_flag},1 ${endX},${endY}`}
            stroke="black"
            fill="none"
          />
        )
        break
      }
      case 'TEXT': {
        const [x, y] = entity.coordinates as Coordinates2D;
        const rotation = entity.rotation ?? 0
        rendering = (
          <text key={key} x={x} y={y} fontSize={entity.height} fill="black" transform={`rotate(${rotation}, ${x}, ${y}) scale(1, -1) translate(0, ${-2 * y})`}>
            {entity.text}
          </text>
        )
        break
      }
      default:
        break;
    }
    return rendering
  };

  // Render a block entity, using the coordinates of the insert
  const renderInsert = (insert: Insert, key: number) => {
    const blockEntities = blocks[insert.name];
    if (!blockEntities) return null;
    // todo de ATTRIB ook nog toevoegen in het block insert
    // todo checken of we de recursieve inserts (die in de blocks zitten) ook getekend worden

    const transform: Transformation = {
      scale: [insert.xscale ?? 1, insert.yscale ?? 1],
      rotation: insert.rotation ?? 0,
      translation: insert.coordinates as Coordinates2D,
    }

    return (
      <g key={key}transform={`rotate(${transform.rotation}, 0, 0) translate(${transform.translation[0]}, ${transform.translation[1]}) scale(${transform.scale[0]}, ${transform.scale[1]})`}>
        {blockEntities.map((entity, index) =>
          renderEntity(entity, index)
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
        <svg width="100%" height="100%" viewBox={`${bounds[0]} ${-bounds[1]} ${width} ${height}`}>
          <g transform={`translate(0, ${height}) scale(1, -1)`}>
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
          </g>
        </svg>
      </div>
    </div>
  );

};

export default SvgPanel;
