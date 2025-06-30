import React from 'react';
import type { SceneObject } from '../../types/scene';

interface StatusBarProps {
  objects: SceneObject[];
  selectedObjects?: SceneObject[];
  selectedObject?: SceneObject | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  isGridSnap: boolean;
  fps?: number;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  objects,
  selectedObjects = [],
  selectedObject,
  transformMode,
  isGridSnap,
  fps = 60,
  canUndo = false,
  canRedo = false,
}) => {
  const formatNumber = (num: number) => num.toFixed(2);
  const selectedCount = selectedObjects.length || (selectedObject ? 1 : 0);
  const singleSelected = selectedObjects.length === 1 ? selectedObjects[0] : selectedObject;

  return (
    <div className="status-bar">
      <div className="status-section">
        <span className="status-label">Objects:</span>
        <span className="status-value">{objects.length}</span>
      </div>

      <div className="status-divider" />

      <div className="status-section">
        <span className="status-label">Selected:</span>
        <span className="status-value">
          {selectedCount === 0 ? 'None' : 
           selectedCount === 1 ? '1 object' : 
           `${selectedCount} objects`}
        </span>
      </div>

      <div className="status-divider" />

      <div className="status-section">
        <span className="status-label">Mode:</span>
        <span className={`status-badge ${transformMode}`}>
          {transformMode === 'translate' && '↔️ Move'}
          {transformMode === 'rotate' && '🔄 Rotate'}
          {transformMode === 'scale' && '📏 Scale'}
        </span>
      </div>

      <div className="status-divider" />

      <div className="status-section">
        <span className="status-label">Grid Snap:</span>
        <span className={`status-indicator ${isGridSnap ? 'active' : 'inactive'}`}>
          {isGridSnap ? '🔒' : '🔓'}
        </span>
      </div>

      <div className="status-divider" />

      <div className="status-section">
        <span className="status-label">History:</span>
        <span className={`status-indicator ${canUndo ? 'active' : 'inactive'}`}>
          ↶ {canUndo ? 'Can Undo' : 'No Undo'}
        </span>
        <span className={`status-indicator ${canRedo ? 'active' : 'inactive'}`}>
          ↷ {canRedo ? 'Can Redo' : 'No Redo'}
        </span>
      </div>

      {singleSelected && (
        <>
          <div className="status-divider" />
          <div className="status-section selected-info">
            <span className="status-label">Selected:</span>
            <span className="status-value">
              {singleSelected.name || singleSelected.type} #{singleSelected.id.slice(-6)}
            </span>
            <div className="status-transform">
              <span className="transform-mini">
                P: ({formatNumber(singleSelected.position[0])}, {formatNumber(singleSelected.position[1])}, {formatNumber(singleSelected.position[2])})
              </span>
            </div>
          </div>
        </>
      )}

      <div className="status-spacer" />

      <div className="status-section">
        <span className="status-label">FPS:</span>
        <span className={`status-value fps ${fps < 30 ? 'low' : fps < 50 ? 'medium' : 'high'}`}>
          {Math.round(fps)}
        </span>
      </div>

      <div className="status-section">
        <span className="status-timestamp">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
