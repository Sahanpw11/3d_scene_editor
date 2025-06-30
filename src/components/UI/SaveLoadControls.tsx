import React, { useRef, useState } from 'react';

interface SaveLoadControlsProps {
  onSaveScene: (sceneName?: string) => void;
  onLoadScene: (file: File) => Promise<boolean>;
  onClearScene: () => void;
  objectCount: number;
}

export const SaveLoadControls: React.FC<SaveLoadControlsProps> = ({
  onSaveScene,
  onLoadScene,
  onClearScene,
  objectCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sceneName, setSceneName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSave = () => {
    const name = sceneName.trim() || undefined;
    onSaveScene(name);
    setSceneName('');
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const success = await onLoadScene(file);
        if (!success) {
          alert('Failed to load scene. Please check the file format.');
        }
      } catch (error) {
        console.error('Error loading scene:', error);
        alert('Error loading scene file.');
      } finally {
        setIsLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleClear = () => {
    if (objectCount > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to clear the scene? This will delete all ${objectCount} objects.`
      );
      if (confirmed) {
        onClearScene();
      }
    } else {
      onClearScene();
    }
  };

  return (
    <div className="save-load-controls">
      <h3>Scene Management</h3>
      
      <div className="save-section">
        <div className="input-group">
          <input
            type="text"
            placeholder="Scene name (optional)"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            className="scene-name-input"
          />
          <button
            className="toolbar-button save-button"
            onClick={handleSave}
            disabled={objectCount === 0}
            title="Save current scene as JSON"
          >
            💾 Save Scene
          </button>
        </div>
      </div>

      <div className="load-section">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          className="toolbar-button load-button"
          onClick={handleLoadClick}
          disabled={isLoading}
          title="Load scene from JSON file"
        >
          {isLoading ? '⏳ Loading...' : '📁 Load Scene'}
        </button>
      </div>

      <div className="clear-section">
        <button
          className="toolbar-button clear-button"
          onClick={handleClear}
          title="Clear all objects from scene"
        >
          🗑️ Clear Scene
        </button>
      </div>

      <div className="scene-stats">
        <small>Objects: {objectCount}</small>
      </div>
    </div>
  );
};
