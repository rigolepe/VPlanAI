import React, { useEffect, useState } from 'react';
import styles from './SvgPanel.module.css';
import { useRef } from 'react';
import { v4 as uuid } from 'uuid';
import useLocalStorage from '../hooks/useLocalStorage';


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
  strokeWidth?: number;
  rotation?: number;
  xscale?: number;
  yscale?: number;
  tag?: string;
  [key: string]: any; // Extendable for other properties
}

interface Insert extends Entity {
  name: string; // Block name
  attribs?: Attrib[]; // Inserted attributes (ignored for now)
}

interface Block {
  id: string;
  block_name: string;
  entities: Entity[];
}

interface Attrib {
  text?: string;
  coordinates: Coordinates2D;
  rotation?: number;
  tag: string;
}

interface SvgPanelProps {
  jsonData: Entity[]; // Expects the JSON data to adhere to the given schema
  filteredJsonData: Entity[];
  changeFilteredJson: (data: any) => void
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
const SvgPanel: React.FC<SvgPanelProps> = ({ jsonData, filteredJsonData, changeFilteredJson }) => {
  const [layers, setLayers] = useState<{ [layer: string]: Entity[] }>({});
  const [blocks, setBlocks] = useState<{ [blockName: string]: Entity[] }>({});
  const [inVisibleLayers, setInvisibleLayers] = useLocalStorage<string[]>('inVisibleLayers', [])
  const [bounds, setBounds] = useState<number[]>([0, 0, 100, 100])
  const [width, setWidth] = useState<number>(100)
  const [height, setHeight] = useState<number>(100)
  const [viewBox, setViewBox] = useState<string>('0 0 -100 100'); // Manage the viewBox state
  const [zoom, setZoom] = useState<number>(1); // Track zoom level
  // const [translation, setTranslation] = useState<number[]>([0, 0]); // Track pan translation
  const [isDragging, setIsDragging] = useState<boolean>(false); // Track drag state
  const lastMousePosition = useRef<{ x: number, y: number } | null>(null); // For drag events
  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const translationRef = useRef<[number, number]>([0, 0]); // Use ref for translation

  const defaultStrokeWidth = 0.1


  // Load the JSON data and group by layers
  useEffect(() => {
    const topLevelEntitiesOriginalJson: Entity[] = [];
    const blockDefinitionsFilteredJson: { [blockName: string]: Entity[] } = {};
    const topLevelEntitiesFilteredJson: Entity[] = [];
    
    if (jsonData && Array.isArray(jsonData)) {
      // Separate blocks from top-level entities
      for (const entity of jsonData) {
        if (entity.type !== 'BLOCK') {
          topLevelEntitiesOriginalJson.push(entity);
        }
      }
    }

    if (filteredJsonData && Array.isArray(filteredJsonData)) {
      // Separate blocks from top-level entities
      for (const entity of filteredJsonData) {
        if (entity.type === 'BLOCK') {
          const blockEntity = entity as unknown as Block;
          blockDefinitionsFilteredJson[blockEntity.block_name] = blockEntity.entities;
        } else {
          topLevelEntitiesFilteredJson.push(entity);
        }
      }
    }

    setBlocks(blockDefinitionsFilteredJson); // Store the blocks for later use in inserts
    setLayers(groupByLayer(topLevelEntitiesOriginalJson)); // Group non-block entities by layer
    const bounds = getMinMaxCoordinates(topLevelEntitiesFilteredJson)
    setBounds(bounds)
    const width = bounds[2] - bounds[0]; // max_x - min_x
    const height = bounds[3] - bounds[1]; // max_y - min_y
    setWidth(width)
    setHeight(height)
    // console.log(`bounds: ${bounds}`)
    // console.log(`width: ${width}, height: ${height}`)
    setViewBox(`${bounds[0] + translationRef.current[0]} ${-bounds[1] + translationRef.current[1]} ${width / zoom} ${height / zoom}`);
  }, [jsonData, inVisibleLayers, filteredJsonData]);

  // Zoom event handler (mouse scroll)
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault(); // Prevent the default zoom behavior

    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;

    // Recalculate the viewBox based on the new zoom level
    const newWidth = width / newZoom;
    const newHeight = height / newZoom;

    setViewBox(`${bounds[0] + translationRef.current[0]} ${-bounds[1] + translationRef.current[1]} ${newWidth} ${newHeight}`);
    setZoom(newZoom);
  };

  // Add and remove event listeners for the wheel event
  useEffect(() => {
    const svgContainer = svgContainerRef.current;

    if (svgContainer) {
      svgContainer.addEventListener('wheel', handleWheel, { passive: false }); // Disable passive mode for wheel event

      // Clean up the event listener when the component is unmounted
      return () => {
        svgContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, [zoom, width, height, bounds]);

  // Mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  // Mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !lastMousePosition.current) return;

    const dx = e.clientX - lastMousePosition.current.x;
    const dy = -(e.clientY - lastMousePosition.current.y);

    // Update the translation reference based on mouse movement
    translationRef.current = [
      translationRef.current[0] - dx / zoom,
      translationRef.current[1] + dy / zoom,
    ];

    // Update the viewBox to reflect the dragging movement
    setViewBox(`${bounds[0] + translationRef.current[0]} ${-bounds[1] + translationRef.current[1]} ${width / zoom} ${height / zoom}`);

    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  // Mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    lastMousePosition.current = null;
  };

  // Update the viewBox when zoom or translation changes
  // useEffect(() => {
  //   setViewBox(`${bounds[0] + translation[0]} ${-bounds[1] + translation[1]} ${width / zoom} ${height / zoom}`);
  // }, [zoom, translation, bounds, width, height]);


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

  function aciToHexColor(aci: number): string {
    // Define the mapping of ACI to RGB colors
    const aciColors: { [key: number]: [number, number, number] } = {
      1: [255, 0, 0],     // Red
      2: [255, 255, 0],   // Yellow
      3: [0, 255, 0],     // Green
      4: [0, 255, 255],   // Cyan
      5: [0, 0, 255],     // Blue
      6: [255, 0, 255],   // Magenta
      7: [255, 255, 255], // White (Black on dark background)
      // ... add additional colors as needed up to 255
      8: [128, 128, 128], // Gray
      // Example of shades can go here, just as placeholders
      256: [0, 0, 0],     // ByLayer (black as default, change according to layer color)
    };

    // Handle "ByLayer" case, which is ACI 256
    if (aci === 256) {
      // Here you would need to return the layer color or a default (black in this example)
      return '#000000'; // Default to black or get from layer information
    }

    // Fallback for unrecognized ACI values
    if (!aciColors[aci]) {
      return '#000000'; // Return black as a fallback
    }

    // Convert the RGB array to a hex string
    const [r, g, b] = aciColors[aci];
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }

  // Function to get the hex color or a default value
  function aciToHexColorOpt(color: number | undefined, defaultColor: string): string {
    return color !== undefined ? aciToHexColor(color) : defaultColor;
  }


  // Drawing functions for each type of entity
  const renderEntity = (entity: Entity) => {
    switch (entity.type) {
      case 'POINT': {
        const [x, y] = entity.coordinates as Coordinates2D;
        return <circle key={uuid()} cx={x} cy={y} r={2} fill="black" />
      }
      case 'LINE': {
        const [start, end] = entity.coordinates as Coordinates2D[];
        return (
          <line
            key={uuid()}
            x1={start[0]}
            y1={start[1]}
            x2={end[0]}
            y2={end[1]}
            stroke={aciToHexColorOpt(entity.color, "black")}
            strokeWidth={defaultStrokeWidth}
          />
        )
      }
      case 'POLYLINE': {
        var coords = entity.coordinates as Coordinates2D[]
        if (entity.is_closed) {
          coords = [...entity.coordinates, entity.coordinates[0]] as Coordinates2D[]
        }
        // console.log(`POLYLINE coords: ${coords}`)
        const points = coords.map((coord) => coord.join(',')).join(' ');
        return (
          <polyline
            key={uuid()}
            points={points}
            fill="none"
            stroke={aciToHexColorOpt(entity.color, "black")}
            strokeWidth={defaultStrokeWidth}
          />
        )
      }
      case 'SOLID': {
        // console.log(`SOLID coords before: ${entity.coordinates}`)
        const coords = [...entity.coordinates, entity.coordinates[0]] as Coordinates2D[]
        // console.log(`SOLID coords: ${coords}`)
        const points = coords.map((coord) => coord.join(',')).join(' ')
        return (
          <polyline
            key={uuid()}
            points={points}
            fill="gray"
            stroke={aciToHexColorOpt(entity.color, "black")}
            strokeWidth={defaultStrokeWidth}
          />
        )
      }
      case 'CIRCLE': {
        const [x, y] = entity.coordinates as Coordinates2D;
        return (
          <circle
            key={uuid()}
            cx={x}
            cy={y}
            r={entity.radius}
            stroke={aciToHexColorOpt(entity.color, "black")}
            fill="none"
            strokeWidth={defaultStrokeWidth}
          />
        )
      }
      case 'ARC': {
        const [x, y] = entity.coordinates as Coordinates2D;
        const [radius, start_angle, end_angle] = [entity.radius!, entity.start_angle!, entity.end_angle!];
        const startX = x + radius * Math.cos(toRadians(start_angle))
        const startY = y + radius * Math.sin(toRadians(start_angle))
        const endX = x + radius * Math.cos(toRadians(end_angle))
        const endY = y + radius * Math.sin(toRadians(end_angle))

        const large_arc_flag = (end_angle - start_angle) > 180 ? 1 : 0;

        return (
          <path
            key={uuid()}
            d={`M ${startX},${startY} A ${radius},${radius} 0 ${large_arc_flag},1 ${endX},${endY}`}
            stroke={aciToHexColorOpt(entity.color, "black")}
            fill="none"
            strokeWidth={defaultStrokeWidth}
          />
        )
      }
      case 'TEXT': {
        const [x, y] = entity.coordinates as Coordinates2D;
        const rotation = entity.rotation ?? 0
        return (
          <text key={uuid()} x={x} y={y} fontSize={entity.height} fill={aciToHexColorOpt(entity.color, "black")} transform={`rotate(${rotation}, ${x}, ${y}) scale(1, -1) translate(0, ${-2 * y})`}>
            {entity.text}
          </text>
        )
      }
      default:
        return null;
    }
  };

  // Render a block entity, using the coordinates of the insert
  const renderInsert = (insert: Insert) => {
    const blockEntities = blocks[insert.name];
    if (!blockEntities) return null;

    const transform: Transformation = {
      scale: [insert.xscale ?? 1, insert.yscale ?? 1],
      rotation: insert.rotation ?? 0,
      translation: insert.coordinates as Coordinates2D,
    }

    return (
      <g key={uuid()} transform={` translate(${transform.translation[0]}, ${transform.translation[1]}) rotate(${transform.rotation}, 0, 0) scale(${transform.scale[0]}, ${transform.scale[1]})`}>
        {blockEntities.map((blockEntity, index) => {
          // console.log(`drawing block entity: ${entity.type} ${entity.coordinates}`)
          if (blockEntity.type === 'INSERT') {
            // return renderInsert(blockEntity as Insert)
            return null;
          } else if (blockEntity.type === 'ATTDEF') {
            const attrib = insert.attribs?.find(attr => attr.tag === blockEntity.tag)
            if (attrib) {
              const attribText = attrib.text ?? blockEntity.text ?? ""
              const [x, y] = attrib.coordinates
              const textRotation = attrib.rotation ?? 0
              return (
                <text key={uuid()} x={x} y={y} fill="black" transform={`rotate(${textRotation}, ${x}, ${y}) scale(1, -1) translate(0, ${-2 * y})`}>
                  {attribText}
                </text>
              )
            } else return null;
          } else {
            return renderEntity(blockEntity)
          }
        }
        )}
      </g>
    );
  };

  const toggleLayer = (name: string) => {
    if (inVisibleLayers.includes(name)) 
      setInvisibleLayers(inVisibleLayers.filter(layer => layer !== name))
    else 
      setInvisibleLayers([...inVisibleLayers, name])

    changeFilteredJson(jsonData.filter((e: any) => {
      if(e && e.layer)
        return !inVisibleLayers.includes(e.layer)

      return true;
    }))
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
      <div className={styles.svgContainer}
        ref={svgContainerRef} // Attach the ref to the container
        onMouseDown={handleMouseDown} // Start drag
        onMouseMove={handleMouseMove} // Drag move
        onMouseUp={handleMouseUp} // End drag
        onMouseLeave={handleMouseUp} // Handle drag stop on mouse leave
      >
        <svg width="100%" height="100%" viewBox={viewBox}>
          <g transform={`translate(0, ${height}) scale(1, -1)`}>
            {Object.keys(layers).filter((layerName, layerIndex) => !inVisibleLayers.includes(layerName)).map((layerName, layerIndex) => (
              <g key={layerIndex} id={layerName}>
                {layers[layerName].map((entity, entityIndex) => {
                  if (entity.type === 'INSERT') {
                    return renderInsert(entity as Insert);
                  } else {
                    return renderEntity(entity);
                  }
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
