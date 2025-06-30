import React from 'react';
import type { SceneSettings } from '../../types/scene';

interface SettingsPanelProps {
  settings: SceneSettings;
  onUpdateSettings: (updates: Partial<SceneSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="settings-panel">
      <h4>Scene Settings</h4>
      
      <div className="setting-group">
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.gridSnap}
              onChange={(e) => onUpdateSettings({ gridSnap: e.target.checked })}
            />
            <span>Grid Snapping</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(e) => onUpdateSettings({ showGrid: e.target.checked })}
            />
            <span>Show Grid</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.showShadows}
              onChange={(e) => onUpdateSettings({ showShadows: e.target.checked })}
            />
            <span>Enable Shadows</span>
          </label>
        </div>
      </div>

      <div className="setting-group">
        <div className="setting-item">
          <label className="setting-label-range">
            Snap Size
            <span className="value">{settings.snapSize.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={settings.snapSize}
            onChange={(e) => onUpdateSettings({ snapSize: parseFloat(e.target.value) })}
            className="setting-slider"
          />
        </div>
      </div>
    </div>
  );
};
