import { useState, useCallback } from 'react';
import type { SceneObject, ObjectType, SceneSettings } from '../types/scene';
import { createSceneObject, snapPosition } from '../types/scene';
import { exportSceneToJSON, downloadScene, loadSceneFromFile } from '../utils/sceneSerializer';

interface HistorySnapshot {
  objects: SceneObject[];
  selectedObjectIds: string[];
  timestamp: number;
  description: string;
}

export const useSceneState = () => {
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [settings, setSettings] = useState<SceneSettings>({
    gridSnap: false,
    snapSize: 1,
    showGrid: true,
    showShadows: true,
  });

  // History system with snapshots
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Helper to create a snapshot
  const createSnapshot = useCallback((description: string): HistorySnapshot => ({
    objects: [...objects],
    selectedObjectIds: [...selectedObjectIds],
    timestamp: Date.now(),
    description,
  }), [objects, selectedObjectIds]);

  // Helper to add a snapshot to history
  const addToHistory = useCallback((description: string) => {
    const snapshot = createSnapshot(description);
    setHistory(prev => {
      // Remove any future history if we're in the middle of the stack
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(snapshot);
      
      // Limit history size to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [createSnapshot, historyIndex]);

  // Helper to restore from snapshot
  const restoreSnapshot = useCallback((snapshot: HistorySnapshot) => {
    setObjects(snapshot.objects);
    setSelectedObjectIds(snapshot.selectedObjectIds);
  }, []);

  // Undo function
  const undo = useCallback((): boolean => {
    if (historyIndex >= 0) {
      const snapshot = history[historyIndex];
      restoreSnapshot(snapshot);
      setHistoryIndex(prev => prev - 1);
      return true;
    }
    return false;
  }, [history, historyIndex, restoreSnapshot]);

  // Redo function
  const redo = useCallback((): boolean => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const snapshot = history[nextIndex];
      restoreSnapshot(snapshot);
      setHistoryIndex(nextIndex);
      return true;
    }
    return false;
  }, [history, historyIndex, restoreSnapshot]);

  // Can undo/redo
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  // Helper to get selected objects
  const selectedObjects = objects.filter(obj => selectedObjectIds.includes(obj.id));
  const selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

  // Add object with history
  const addObject = useCallback((type: ObjectType) => {
    // Save current state to history before making changes
    addToHistory(`Add ${type}`);
    
    const newObject = createSceneObject(
      type,
      [Math.random() * 4 - 2, Math.random() * 2 + 1, Math.random() * 4 - 2]
    );

    setObjects(prev => [...prev, newObject]);
    setSelectedObjectIds([newObject.id]);
  }, [addToHistory]);

  // Select objects (supports multi-selection)
  const selectObjects = useCallback((objectIds: string[]) => {
    setSelectedObjectIds(objectIds);
  }, []);

  // Select single object (for compatibility)
  const selectObject = useCallback((objectId: string | null) => {
    setSelectedObjectIds(objectId ? [objectId] : []);
  }, []);

  // Update object with history
  const updateObject = useCallback((objectId: string, updates: Partial<SceneObject>) => {
    const targetObject = objects.find(obj => obj.id === objectId);
    if (!targetObject) return;

    // Save current state to history before making changes
    addToHistory(`Modify ${targetObject.name}`);

    // Apply grid snapping if enabled
    const finalUpdates = settings.gridSnap && updates.position
      ? { ...updates, position: snapPosition(updates.position, settings.snapSize) }
      : updates;

    setObjects(prev => prev.map(obj => 
      obj.id === objectId ? { ...obj, ...finalUpdates } : obj
    ));
  }, [objects, settings.gridSnap, settings.snapSize, addToHistory]);

  // Update object material
  const updateObjectMaterial = useCallback((objectId: string, materialUpdates: Partial<SceneObject['material']>) => {
    const targetObject = objects.find(obj => obj.id === objectId);
    if (!targetObject) return;
    
    const updatedMaterial = { ...targetObject.material, ...materialUpdates };
    updateObject(objectId, { material: updatedMaterial });
  }, [objects, updateObject]);

  // Delete objects with history
  const deleteObjects = useCallback((objectIds: string[]) => {
    if (objectIds.length === 0) return;

    // Save current state to history before making changes
    addToHistory(`Delete ${objectIds.length} object(s)`);

    setObjects(prev => prev.filter(obj => !objectIds.includes(obj.id)));
    setSelectedObjectIds(prev => prev.filter(id => !objectIds.includes(id)));
  }, [addToHistory]);

  // Delete selected objects
  const deleteSelectedObject = useCallback(() => {
    if (selectedObjectIds.length > 0) {
      deleteObjects(selectedObjectIds);
    }
  }, [selectedObjectIds, deleteObjects]);

  // Delete single object
  const deleteObject = useCallback((objectId: string) => {
    deleteObjects([objectId]);
  }, [deleteObjects]);

  // Duplicate objects
  const duplicateObjects = useCallback((objectIds: string[]) => {
    if (objectIds.length === 0) return;

    // Save current state to history before making changes
    addToHistory(`Duplicate ${objectIds.length} object(s)`);

    const objectsToDuplicate = objects.filter(obj => objectIds.includes(obj.id));
    const newObjects = objectsToDuplicate.map(obj => ({
      ...obj,
      id: `${obj.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${obj.name}_copy`,
      position: [obj.position[0] + 1, obj.position[1], obj.position[2]] as [number, number, number],
    }));

    setObjects(prev => [...prev, ...newObjects]);
    setSelectedObjectIds(newObjects.map(obj => obj.id));
  }, [objects, addToHistory]);

  // Duplicate single object
  const duplicateObject = useCallback((objectId: string) => {
    duplicateObjects([objectId]);
  }, [duplicateObjects]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<SceneSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Save scene
  const saveScene = useCallback(() => {
    const sceneData = exportSceneToJSON(objects);
    downloadScene(sceneData, 'scene.json');
  }, [objects]);

  // Load scene
  const loadScene = useCallback(async (file: File): Promise<boolean> => {
    try {
      const sceneData = await loadSceneFromFile(file);
      
      if (!sceneData) {
        return false;
      }
      
      // Save current state to history before loading
      addToHistory('Load scene');
      
      setObjects(sceneData.objects);
      setSelectedObjectIds([]);
      return true;
    } catch (error) {
      console.error('Failed to load scene:', error);
      return false;
    }
  }, [addToHistory]);

  // Clear scene
  const clearScene = useCallback(() => {
    if (objects.length > 0) {
      // Save current state to history before clearing
      addToHistory('Clear scene');
      
      setObjects([]);
      setSelectedObjectIds([]);
    }
  }, [objects.length, addToHistory]);

  return {
    // State
    objects,
    selectedObjectIds,
    selectedObjects,
    selectedObject,
    transformMode,
    settings,
    
    // History
    canUndo,
    canRedo,
    undo,
    redo,
    
    // Actions
    addObject,
    selectObjects,
    selectObject,
    updateObject,
    updateObjectMaterial,
    deleteObject,
    deleteObjects,
    deleteSelectedObject,
    duplicateObject,
    duplicateObjects,
    setTransformMode,
    updateSettings,
    saveScene,
    loadScene,
    clearScene,
  };
};
