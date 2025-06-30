import { useState, useCallback, useRef } from 'react';
import type { HistoryAction, HistoryState } from '../types/scene';

export const useHistory = (maxHistory: number = 50) => {
  const [history, setHistory] = useState<HistoryState>({
    actions: [],
    currentIndex: -1,
    maxHistory,
  });

  // Use refs to avoid stale closures
  const historyRef = useRef(history);
  historyRef.current = history;

  const addAction = useCallback((action: Omit<HistoryAction, 'id' | 'timestamp'>) => {
    const newAction: HistoryAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove any actions after current index (when adding new action after undo)
      const actionsToKeep = prev.actions.slice(0, prev.currentIndex + 1);
      
      // Add new action
      const newActions = [...actionsToKeep, newAction];
      
      // Limit history size
      if (newActions.length > maxHistory) {
        newActions.shift();
      }
      
      return {
        ...prev,
        actions: newActions,
        currentIndex: newActions.length - 1,
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    const currentHistory = historyRef.current;
    if (currentHistory.currentIndex >= 0) {
      const action = currentHistory.actions[currentHistory.currentIndex];
      try {
        action.undo();
        setHistory(prev => ({
          ...prev,
          currentIndex: prev.currentIndex - 1,
        }));
        return true;
      } catch (error) {
        console.error('Undo failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  const redo = useCallback(() => {
    const currentHistory = historyRef.current;
    if (currentHistory.currentIndex < currentHistory.actions.length - 1) {
      const nextIndex = currentHistory.currentIndex + 1;
      const action = currentHistory.actions[nextIndex];
      try {
        action.redo();
        setHistory(prev => ({
          ...prev,
          currentIndex: nextIndex,
        }));
        return true;
      } catch (error) {
        console.error('Redo failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  const canUndo = history.currentIndex >= 0;
  const canRedo = history.currentIndex < history.actions.length - 1;

  const clearHistory = useCallback(() => {
    setHistory({
      actions: [],
      currentIndex: -1,
      maxHistory,
    });
  }, [maxHistory]);

  const getLastAction = useCallback(() => {
    return history.currentIndex >= 0 ? history.actions[history.currentIndex] : null;
  }, [history]);

  return {
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getLastAction,
    history: history.actions,
    currentIndex: history.currentIndex,
  };
};
