import React, { useState, useEffect } from 'react';
import type { SceneObject } from '../../types/scene';

interface PrecisionInputProps {
  selectedObjects: SceneObject[];
  onUpdateObjects: (updates: Partial<SceneObject>) => void;
}

export const PrecisionInput: React.FC<PrecisionInputProps> = ({
  selectedObjects,
  onUpdateObjects,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [lockProportions, setLockProportions] = useState(true);

  // Update inputs when selection changes
  useEffect(() => {
    if (selectedObjects.length === 1) {
      const obj = selectedObjects[0];
      setPosition({ x: obj.position[0], y: obj.position[1], z: obj.position[2] });
      setRotation({ 
        x: obj.rotation[0] * 180 / Math.PI, 
        y: obj.rotation[1] * 180 / Math.PI, 
        z: obj.rotation[2] * 180 / Math.PI 
      });
      setScale({ x: obj.scale[0], y: obj.scale[1], z: obj.scale[2] });
    } else if (selectedObjects.length > 1) {
      // For multiple objects, show average values
      const avgPos = selectedObjects.reduce((acc, obj) => ({
        x: acc.x + obj.position[0],
        y: acc.y + obj.position[1],
        z: acc.z + obj.position[2],
      }), { x: 0, y: 0, z: 0 });
      
      setPosition({
        x: avgPos.x / selectedObjects.length,
        y: avgPos.y / selectedObjects.length,
        z: avgPos.z / selectedObjects.length,
      });
    }
  }, [selectedObjects]);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = { ...position, [axis]: value };
    setPosition(newPosition);
    
    if (selectedObjects.length === 1) {
      onUpdateObjects({
        position: [newPosition.x, newPosition.y, newPosition.z],
      });
    }
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation = { ...rotation, [axis]: value };
    setRotation(newRotation);
    
    if (selectedObjects.length === 1) {
      onUpdateObjects({
        rotation: [
          newRotation.x * Math.PI / 180,
          newRotation.y * Math.PI / 180,
          newRotation.z * Math.PI / 180,
        ],
      });
    }
  };

  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    let newScale = { ...scale };
    
    if (lockProportions && selectedObjects.length === 1) {
      // Maintain proportions
      const ratio = value / scale[axis];
      newScale = {
        x: scale.x * ratio,
        y: scale.y * ratio,
        z: scale.z * ratio,
      };
    } else {
      newScale[axis] = value;
    }
    
    setScale(newScale);
    
    if (selectedObjects.length === 1) {
      onUpdateObjects({
        scale: [newScale.x, newScale.y, newScale.z],
      });
    }
  };

  const resetTransform = () => {
    setPosition({ x: 0, y: 0, z: 0 });
    setRotation({ x: 0, y: 0, z: 0 });
    setScale({ x: 1, y: 1, z: 1 });
    
    onUpdateObjects({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
  };

  if (selectedObjects.length === 0) {
    return (
      <div className="precision-input">
        <div className="precision-header">
          <h4>Transform</h4>
          <span className="no-selection">No objects selected</span>
        </div>
      </div>
    );
  }

  const isMultiSelection = selectedObjects.length > 1;

  return (
    <div className="precision-input">
      <div className="precision-header">
        <h4>Transform</h4>
        {isMultiSelection && (
          <span className="multi-selection">{selectedObjects.length} objects</span>
        )}
        <button 
          className="reset-button"
          onClick={resetTransform}
          title="Reset Transform"
          disabled={isMultiSelection}
        >
          ↺
        </button>
      </div>

      {/* Position */}
      <div className="transform-group">
        <label className="transform-label">Position</label>
        <div className="input-row">
          <div className="input-field">
            <label>X</label>
            <input
              type="number"
              value={position.x.toFixed(3)}
              onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
              step="0.1"
              disabled={isMultiSelection}
            />
          </div>
          <div className="input-field">
            <label>Y</label>
            <input
              type="number"
              value={position.y.toFixed(3)}
              onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
              step="0.1"
              disabled={isMultiSelection}
            />
          </div>
          <div className="input-field">
            <label>Z</label>
            <input
              type="number"
              value={position.z.toFixed(3)}
              onChange={(e) => handlePositionChange('z', parseFloat(e.target.value) || 0)}
              step="0.1"
              disabled={isMultiSelection}
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="transform-group">
        <label className="transform-label">Rotation (degrees)</label>
        <div className="input-row">
          <div className="input-field">
            <label>X</label>
            <input
              type="number"
              value={rotation.x.toFixed(1)}
              onChange={(e) => handleRotationChange('x', parseFloat(e.target.value) || 0)}
              step="1"
              disabled={isMultiSelection}
            />
          </div>
          <div className="input-field">
            <label>Y</label>
            <input
              type="number"
              value={rotation.y.toFixed(1)}
              onChange={(e) => handleRotationChange('y', parseFloat(e.target.value) || 0)}
              step="1"
              disabled={isMultiSelection}
            />
          </div>
          <div className="input-field">
            <label>Z</label>
            <input
              type="number"
              value={rotation.z.toFixed(1)}
              onChange={(e) => handleRotationChange('z', parseFloat(e.target.value) || 0)}
              step="1"
              disabled={isMultiSelection}
            />
          </div>
        </div>
      </div>

      {/* Scale */}
      <div className="transform-group">
        <div className="scale-header">
          <label className="transform-label">Scale</label>
          <label className="lock-checkbox">
            <input
              type="checkbox"
              checked={lockProportions}
              onChange={(e) => setLockProportions(e.target.checked)}
              disabled={isMultiSelection}
            />
            <span>🔗</span>
          </label>
        </div>
        <div className="input-row">
          <div className="input-field">
            <label>X</label>
            <input
              type="number"
              value={scale.x.toFixed(3)}
              onChange={(e) => handleScaleChange('x', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0.001"
              disabled={isMultiSelection}
            />
          </div>
          <div className="input-field">
            <label>Y</label>
            <input
              type="number"
              value={scale.y.toFixed(3)}
              onChange={(e) => handleScaleChange('y', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0.001"
              disabled={isMultiSelection}
            />
          </div>
          <div className="input-field">
            <label>Z</label>
            <input
              type="number"
              value={scale.z.toFixed(3)}
              onChange={(e) => handleScaleChange('z', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0.001"
              disabled={isMultiSelection}
            />
          </div>
        </div>
      </div>

      {isMultiSelection && (
        <div className="multi-selection-note">
          <small>Individual transform editing available for single selection only</small>
        </div>
      )}
    </div>
  );
};
