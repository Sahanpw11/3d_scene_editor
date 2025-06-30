import { useState, useCallback } from 'react';

export interface HistorySnapshot {
  id: string;
  description: string;
  timestamp: number;
  data: any;
}

export const useHistory = <T>(maxHistory: number = 50) => {
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addSnapshot = useCallback((description: string, data: T) => {
    const snapshot: HistorySnapshot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description,
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)) // Deep clone to prevent mutations
    };

    setSnapshots(prev => {
      // Remove any snapshots after current index (when adding new snapshot after undo)
      const snapshotsToKeep = prev.slice(0, currentIndex + 1);
      
      // Add new snapshot
      const newSnapshots = [...snapshotsToKeep, snapshot];
      
      // Limit history size
      if (newSnapshots.length > maxHistory) {
        newSnapshots.shift();
        return newSnapshots;
      }
      
      return newSnapshots;
    });

    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= maxHistory ? maxHistory - 1 : newIndex;
    });
  }, [currentIndex, maxHistory]);

  const undo = useCallback((): T | null => {
    if (currentIndex > 0) {
      const previousSnapshot = snapshots[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      return previousSnapshot.data;
    }
    return null;
  }, [currentIndex, snapshots]);

  const redo = useCallback((): T | null => {
    if (currentIndex < snapshots.length - 1) {
      const nextSnapshot = snapshots[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      return nextSnapshot.data;
    }
    return null;
  }, [currentIndex, snapshots]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < snapshots.length - 1;

  const clearHistory = useCallback(() => {
    setSnapshots([]);
    setCurrentIndex(-1);
  }, []);

  return {
    addSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    snapshots,
    currentIndex,
  };
};
