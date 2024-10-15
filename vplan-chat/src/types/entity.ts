// Define the interface for the entities based on the JSON schema
export interface Coordinates2D extends Array<number> {
    0: number; // X-coordinate
    1: number; // Y-coordinate
}

export interface Entity {
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

export interface Insert extends Entity {
    name: string; // Block name
    attribs?: Attrib[]; // Inserted attributes (ignored for now)
}

export interface Block extends Entity {
    id: string;
    block_name: string;
    entities: Entity[];
}

export interface Attrib {
    text?: string;
    coordinates: Coordinates2D;
    rotation?: number;
    tag: string;
}

export const POINT_BASED = ['POINT', 'CIRCLE', 'ARC', 'TEXT', 'INSERT'];
export const LINE_BASED = ['LINE', 'POLYLINE', 'SOLID'];
export const CONCRETE_TYPES = ['POINT', 'LINE', 'POLYLINE', 'SOLID', 'CIRCLE', 'ARC', 'TEXT']