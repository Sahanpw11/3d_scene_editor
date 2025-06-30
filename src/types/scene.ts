import { Vector3, Euler } from 'three';

export type ObjectType = 'cube' | 'sphere';

export interface SceneObject {
  id: string;
  name: string;
  type: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material: {
    color: string;
    roughness: number;
    metalness: number;
    emissive: string;
    emissiveIntensity: number;
  };
}

export interface SceneData {
  objects: SceneObject[];
  metadata: {
    version: string;
    created: string;
    name?: string;
  };
}

export interface TransformMode {
  mode: 'translate' | 'rotate' | 'scale';
}

export interface SceneSettings {
  gridSnap: boolean;
  snapSize: number;
  showGrid: boolean;
  showShadows: boolean;
}

export interface SceneState {
  objects: SceneObject[];
  selectedObjectIds: string[]; // Changed from single to multiple selection
  transformMode: TransformMode['mode'];
  settings: SceneSettings;
}

// History system types
export interface HistoryAction {
  id: string;
  type: 'create' | 'delete' | 'modify';
  timestamp: number;
  description: string;
  data: Record<string, unknown>;
  undo: () => void;
  redo: () => void;
}

export interface HistoryState {
  actions: HistoryAction[];
  currentIndex: number;
  maxHistory: number;
}

// Helper functions for working with scene objects
export const createSceneObject = (
  type: ObjectType,
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  material: SceneObject['material'] = {
    color: type === 'cube' ? '#4f46e5' : '#ef4444',
    roughness: 0.3,
    metalness: 0.1,
    emissive: '#000000',
    emissiveIntensity: 0,
  },
  name?: string
): SceneObject => ({
  id: generateId(),
  name: name || `${type}_${Date.now().toString().slice(-4)}`,
  type,
  position,
  rotation,
  scale,
  material,
});

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Grid snapping helper
export const snapToGrid = (value: number, snapSize: number): number => {
  return Math.round(value / snapSize) * snapSize;
};

export const snapPosition = (
  position: [number, number, number], 
  snapSize: number
): [number, number, number] => {
  return [
    snapToGrid(position[0], snapSize),
    snapToGrid(position[1], snapSize),
    snapToGrid(position[2], snapSize)
  ];
};

// Vector conversion helpers
export const arrayToVector3 = (arr: [number, number, number]): Vector3 => {
  return new Vector3(arr[0], arr[1], arr[2]);
};

export const vector3ToArray = (vector: Vector3): [number, number, number] => {
  return [vector.x, vector.y, vector.z];
};

export const arrayToEuler = (arr: [number, number, number]): Euler => {
  return new Euler(arr[0], arr[1], arr[2]);
};

export const eulerToArray = (euler: Euler): [number, number, number] => {
  return [euler.x, euler.y, euler.z];
};
