import React from 'react';
import { MaterialEditor } from './MaterialEditor';
import type { SceneObject } from '../../types/scene';

interface ObjectListProps {
  objects: SceneObject[];
  selectedObjectId: string | null;
  onSelectObject: (objectId: string | null) => void;
  onDeleteObject: (objectId: string) => void;
  onDuplicateObject: (objectId: string) => void;
  onUpdateObjectMaterial: (objectId: string, material: Partial<SceneObject['material']>) => void;
}

export const ObjectList: React.FC<ObjectListProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  onDeleteObject,
  onDuplicateObject,
  onUpdateObjectMaterial,
}) => {
  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'cube':
        return '⬛';
      case 'sphere':
        return '⚫';
      default:
        return '⬛';
    }
  };

  const formatTransform = (values: [number, number, number]): string => {
    return values.map(v => v.toFixed(1)).join(', ');
  };

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  if (objects.length === 0) {
    return (
      <div className="modern-object-list">
        <div className="section-header">
          <h3>Objects</h3>
          <span className="count">0</span>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>No objects in scene</p>
          <small>Add objects using the toolbar above</small>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-object-list">
      <div className="section-header">
        <h3>Objects</h3>
        <span className="count">{objects.length}</span>
      </div>
      
      <div className="object-list-container">
        {objects.map((object) => (
          <div
            key={object.id}
            className={`modern-object-item ${object.id === selectedObjectId ? 'selected' : ''}`}
            onClick={() => onSelectObject(object.id)}
          >
            <div className="object-main">
              <div className="object-icon">
                <span style={{ color: object.material.color }}>
                  {getObjectIcon(object.type)}
                </span>
              </div>
              <div className="object-info">
                <div className="object-name">{object.type}</div>
                <div className="object-id">#{object.id.slice(-6)}</div>
              </div>
              <div className="object-actions">
                <button
                  className="action-button duplicate"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateObject(object.id);
                  }}
                  title="Duplicate"
                >
                  📋
                </button>
                <button
                  className="action-button delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteObject(object.id);
                  }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            {object.id === selectedObjectId && (
              <div className="object-details">
                <div className="transform-summary">
                  <div className="transform-item">
                    <span className="label">Position:</span>
                    <span className="value">{formatTransform(object.position)}</span>
                  </div>
                  <div className="transform-item">
                    <span className="label">Rotation:</span>
                    <span className="value">{formatTransform(object.rotation.map(r => r * 180 / Math.PI) as [number, number, number])}°</span>
                  </div>
                  <div className="transform-item">
                    <span className="label">Scale:</span>
                    <span className="value">{formatTransform(object.scale)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Material Editor for Selected Object */}
      {selectedObject && (
        <div className="material-editor-container">
          <MaterialEditor
            object={selectedObject}
            onUpdateMaterial={(materialUpdates) => 
              onUpdateObjectMaterial(selectedObject.id, materialUpdates)
            }
          />
        </div>
      )}
    </div>
  );
};
