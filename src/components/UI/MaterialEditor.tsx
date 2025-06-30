import React from 'react';
import type { SceneObject } from '../../types/scene';

interface MaterialEditorProps {
  object: SceneObject;
  onUpdateMaterial: (materialUpdates: Partial<SceneObject['material']>) => void;
}

export const MaterialEditor: React.FC<MaterialEditorProps> = ({
  object,
  onUpdateMaterial,
}) => {
  const handleColorChange = (color: string) => {
    onUpdateMaterial({ color });
  };

  const handleSliderChange = (property: keyof SceneObject['material'], value: number) => {
    onUpdateMaterial({ [property]: value });
  };

  const materialPresets = [
    { name: 'Plastic', roughness: 0.7, metalness: 0.0 },
    { name: 'Metal', roughness: 0.1, metalness: 1.0 },
    { name: 'Gold', roughness: 0.2, metalness: 1.0, color: '#ffd700' },
    { name: 'Chrome', roughness: 0.05, metalness: 1.0, color: '#c0c0c0' },
    { name: 'Rubber', roughness: 0.9, metalness: 0.0 },
    { name: 'Glass', roughness: 0.0, metalness: 0.0, color: '#ffffff' },
  ];

  const colorPresets = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#6b7280', '#374151', '#1f2937'
  ];

  return (
    <div className="material-editor">
      <h4>Material Properties</h4>
      
      {/* Color Picker */}
      <div className="material-section">
        <label>Color</label>
        <div className="color-picker">
          <input
            type="color"
            value={object.material.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="color-input"
          />
          <div className="color-presets">
            {colorPresets.map((color) => (
              <button
                key={color}
                className={`color-preset ${object.material.color === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Material Sliders */}
      <div className="material-section">
        <label>
          Roughness
          <span className="value">{object.material.roughness.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={object.material.roughness}
          onChange={(e) => handleSliderChange('roughness', parseFloat(e.target.value))}
          className="material-slider"
        />
      </div>

      <div className="material-section">
        <label>
          Metalness
          <span className="value">{object.material.metalness.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={object.material.metalness}
          onChange={(e) => handleSliderChange('metalness', parseFloat(e.target.value))}
          className="material-slider"
        />
      </div>

      <div className="material-section">
        <label>
          Emissive Intensity
          <span className="value">{object.material.emissiveIntensity.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={object.material.emissiveIntensity}
          onChange={(e) => handleSliderChange('emissiveIntensity', parseFloat(e.target.value))}
          className="material-slider"
        />
      </div>

      {/* Material Presets */}
      <div className="material-section">
        <label>Material Presets</label>
        <div className="preset-buttons">
          {materialPresets.map((preset) => (
            <button
              key={preset.name}
              className="preset-button"
              onClick={() => {
                onUpdateMaterial({
                  roughness: preset.roughness,
                  metalness: preset.metalness,
                  ...(preset.color && { color: preset.color }),
                });
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
