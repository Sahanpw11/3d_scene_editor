import { useState, useCallback, useRef } from 'react';
import type { SceneObject, ObjectType, SceneSettings } from '../types/scene';
import { createSceneObject, snapPosition } from '../types/scene';
import { exportSceneToJSON, downloadScene, loadSceneFromFile } from '../utils/sceneSerializer';
import { useHistory } from './useHistory';

export const useSceneState = () => {
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [settings, setSettings] = useState<SceneSettings>({
    gridSnap: false,
    snapSize: 0.5,
    showGrid: true,
    showShadows: true,
  });

  const { addAction, undo, redo, canUndo, canRedo } = useHistory();

  // Use refs to avoid stale closure issues
  const objectsRef = useRef(objects);
  const selectedObjectIdsRef = useRef(selectedObjectIds);

  // Keep refs in sync
  objectsRef.current = objects;
  selectedObjectIdsRef.current = selectedObjectIds;

  // Helper to get selected objects
  const selectedObjects = objects.filter(obj => selectedObjectIds.includes(obj.id));
  const selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;
  const selectedObjectId = selectedObjectIds.length === 1 ? selectedObjectIds[0] : null;

  // Add object with history
  const addObject = useCallback((type: ObjectType) => {
    const newObject = createSceneObject(
      type,
      [Math.random() * 4 - 2, Math.random() * 2 + 1, Math.random() * 4 - 2] // Random position
    );

    // Apply changes immediately
    setObjects(prev => [...prev, newObject]);
    setSelectedObjectIds([newObject.id]);

    // Add to history
    addAction({
      type: 'create',
      description: `Create ${type}`,
      data: { objectId: newObject.id, object: newObject },
      undo: () => {
        setObjects(prev => prev.filter(obj => obj.id !== newObject.id));
        setSelectedObjectIds(prev => prev.filter(id => id !== newObject.id));
      },
      redo: () => {
        setObjects(prev => [...prev, newObject]);
        setSelectedObjectIds([newObject.id]);
      },
    });
  }, [addAction]);

  // Select objects (supports multi-selection)
  const selectObjects = useCallback((objectIds: string[]) => {
    setSelectedObjectIds(objectIds);
  }, []);

  // Legacy single selection for compatibility
  const selectObject = useCallback((objectId: string | null) => {
    setSelectedObjectIds(objectId ? [objectId] : []);
  }, []);

  // Update object with history
  const updateObject = useCallback((objectId: string, updates: Partial<SceneObject>) => {
    // Apply grid snapping if enabled
    const finalUpdates = settings.gridSnap && updates.position
      ? { ...updates, position: snapPosition(updates.position, settings.snapSize) }
      : updates;

    // Find the object first
    const targetObject = objectsRef.current.find(obj => obj.id === objectId);
    if (!targetObject) return;

    const previousObjectState = { ...targetObject };
    const newObjectState: SceneObject = Object.assign({}, previousObjectState, finalUpdates);
    
    // Apply changes immediately
    setObjects(prev => prev.map(obj => 
      obj.id === objectId ? newObjectState : obj
    ));

    // Add to history
    addAction({
      type: 'modify',
      description: `Modify ${previousObjectState.name}`,
      data: { objectId, previousObjectState, newObjectState },
      undo: () => {
        setObjects(prev => prev.map(obj => 
          obj.id === objectId ? previousObjectState : obj
        ));
      },
      redo: () => {
        setObjects(prev => prev.map(obj => 
          obj.id === objectId ? newObjectState : obj
        ));
      },
    });
  }, [settings.gridSnap, settings.snapSize, addAction]);

  // Update object material
  const updateObjectMaterial = useCallback((objectId: string, materialUpdates: Partial<SceneObject['material']>) => {
    const currentObject = objects.find(obj => obj.id === objectId);
    if (!currentObject) return;
    
    const updatedMaterial = { ...currentObject.material, ...materialUpdates };
    updateObject(objectId, { material: updatedMaterial });
  }, [objects, updateObject]);

  // Delete objects with history
  const deleteObjects = useCallback((objectIds: string[]) => {
    if (objectIds.length === 0) return;
    
    // Capture objects that will be deleted
    let objectsToDelete: SceneObject[] = [];
    
    // Apply changes immediately and capture deleted objects
    setObjects(prev => {
      objectsToDelete = prev.filter(obj => objectIds.includes(obj.id));
      return prev.filter(obj => !objectIds.includes(obj.id));
    });
    
    setSelectedObjectIds(prev => prev.filter(id => !objectIds.includes(id)));

    // Add to history
    addAction({
      type: 'delete',
      description: `Delete ${objectsToDelete.length} object(s)`,
      data: { deletedObjects: objectsToDelete },
      undo: () => {
        setObjects(prev => [...prev, ...objectsToDelete]);
        setSelectedObjectIds(objectIds);
      },
      redo: () => {
        setObjects(prev => prev.filter(obj => !objectIds.includes(obj.id)));
        setSelectedObjectIds(prev => prev.filter(id => !objectIds.includes(id)));
      },
    });
  }, [addAction]);

  // Delete selected objects
  const deleteSelectedObjects = useCallback(() => {
    if (selectedObjectIds.length > 0) {
      deleteObjects(selectedObjectIds);
    }
  }, [selectedObjectIds, deleteObjects]);

  // Legacy single delete for compatibility
  const deleteSelectedObject = useCallback(() => {
    deleteSelectedObjects();
  }, [deleteSelectedObjects]);

  // Duplicate objects
  const duplicateObjects = useCallback((objectIds: string[]) => {
    if (objectIds.length === 0) return;
    
    // Find objects to duplicate
    let objectsToDuplicate: SceneObject[] = [];
    let newObjects: SceneObject[] = [];

    setObjects(prev => {
      objectsToDuplicate = prev.filter(obj => objectIds.includes(obj.id));
      newObjects = objectsToDuplicate.map(obj => ({
        ...obj,
        id: `${obj.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${obj.name}_copy`,
        position: [obj.position[0] + 1, obj.position[1], obj.position[2]] as [number, number, number],
      }));
      return [...prev, ...newObjects];
    });
    
    setSelectedObjectIds(newObjects.map(obj => obj.id));

    addAction({
      type: 'create',
      description: `Duplicate ${objectsToDuplicate.length} object(s)`,
      data: { newObjects },
      undo: () => {
        const newObjectIds = newObjects.map(obj => obj.id);
        setObjects(prev => prev.filter(obj => !newObjectIds.includes(obj.id)));
        setSelectedObjectIds(objectIds); // restore original selection
      },
      redo: () => {
        setObjects(prev => [...prev, ...newObjects]);
        setSelectedObjectIds(newObjects.map(obj => obj.id));
      },
    });
  }, [addAction]);

  // Legacy single duplicate for compatibility
  const duplicateObject = useCallback((objectId: string) => {
    duplicateObjects([objectId]);
  }, [duplicateObjects]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<SceneSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Save scene
  const saveScene = useCallback((sceneName?: string) => {
    const sceneData = exportSceneToJSON(objects, sceneName);
    downloadScene(sceneData);
  }, [objects]);

  // Load scene
  const loadScene = useCallback(async (file: File): Promise<boolean> => {
    try {
      const sceneData = await loadSceneFromFile(file);
      if (sceneData) {
        const previousObjects = [...objects];
        const previousSelection = [...selectedObjectIds];
        
        setObjects(sceneData.objects);
        setSelectedObjectIds([]);

        addAction({
          type: 'modify',
          description: 'Load scene',
          data: { sceneData },
          undo: () => {
            setObjects(previousObjects);
            setSelectedObjectIds(previousSelection);
          },
          redo: () => {
            setObjects(sceneData.objects);
            setSelectedObjectIds([]);
          },
        });

        return true;
      }
    } catch (error) {
      console.error('Failed to load scene:', error);
    }
    return false;
  }, [objects, selectedObjectIds, addAction]);

  // Clear scene
  const clearScene = useCallback(() => {
    const previousObjects = [...objects];
    const previousSelection = [...selectedObjectIds];

    setObjects([]);
    setSelectedObjectIds([]);

    addAction({
      type: 'delete',
      description: 'Clear scene',
      data: { clearedObjects: previousObjects },
      undo: () => {
        setObjects(previousObjects);
        setSelectedObjectIds(previousSelection);
      },
      redo: () => {
        setObjects([]);
        setSelectedObjectIds([]);
      },
    });
  }, [objects, selectedObjectIds, addAction]);

  // Legacy delete for compatibility
  const deleteObject = useCallback((objectId: string) => {
    deleteObjects([objectId]);
  }, [deleteObjects]);

  return {
    // State
    objects,
    selectedObjectIds,
    selectedObjects,
    selectedObject,
    selectedObjectId, // For compatibility
    transformMode,
    settings,

    // History
    canUndo,
    canRedo,
    undo,
    redo,

    // Object operations
    addObject,
    selectObjects,
    selectObject, // For compatibility
    updateObject,
    updateObjectMaterial,
    deleteObjects,
    deleteObject, // For compatibility
    deleteSelectedObjects,
    deleteSelectedObject, // For compatibility
    duplicateObjects,
    duplicateObject, // For compatibility
    setTransformMode,

    // Scene operations
    updateSettings,
    saveScene,
    loadScene,
    clearScene,
  };
};
