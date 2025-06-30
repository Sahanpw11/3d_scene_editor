import React from 'react';
import type { ObjectType } from '../../types/scene';

interface ToolbarProps {
  onAddObject: (type: ObjectType) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  transformMode: 'translate' | 'rotate' | 'scale';
  onSetTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  hasSelection: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddObject,
  onDeleteSelected,
  onDuplicateSelected,
  transformMode,
  onSetTransformMode,
  hasSelection,
}) => {
  const tools = [
    { mode: 'translate' as const, icon: '↔️', label: 'Move', shortcut: 'G' },
    { mode: 'rotate' as const, icon: '🔄', label: 'Rotate', shortcut: 'R' },
    { mode: 'scale' as const, icon: '📏', label: 'Scale', shortcut: 'S' },
  ];

  return (
    <div className="modern-toolbar">
      {/* Object Creation */}
      <div className="toolbar-group">
        <div className="group-title">Create</div>
        <div className="button-row">
          <button 
            className="modern-button primary"
            onClick={() => onAddObject('cube')}
            title="Add Cube"
          >
            <span className="icon">⬛</span>
            <span className="label">Cube</span>
          </button>
          <button 
            className="modern-button primary"
            onClick={() => onAddObject('sphere')}
            title="Add Sphere"
          >
            <span className="icon">⚫</span>
            <span className="label">Sphere</span>
          </button>
        </div>
      </div>

      {/* Transform Tools */}
      <div className="toolbar-group">
        <div className="group-title">Transform</div>
        <div className="button-row">
          {tools.map((tool) => (
            <button
              key={tool.mode}
              className={`modern-button tool ${transformMode === tool.mode ? 'active' : ''}`}
              onClick={() => onSetTransformMode(tool.mode)}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <span className="icon">{tool.icon}</span>
              <span className="label">{tool.label}</span>
              <span className="shortcut">{tool.shortcut}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Object Actions */}
      <div className="toolbar-group">
        <div className="group-title">Actions</div>
        <div className="button-row">
          <button
            className="modern-button secondary"
            onClick={onDuplicateSelected}
            disabled={!hasSelection}
            title="Duplicate Selected (Ctrl+D)"
          >
            <span className="icon">📋</span>
            <span className="label">Duplicate</span>
          </button>
          <button
            className="modern-button danger"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            title="Delete Selected (Delete)"
          >
            <span className="icon">🗑️</span>
            <span className="label">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
