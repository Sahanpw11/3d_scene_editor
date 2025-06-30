import { useEffect, useState } from 'react';
import { Scene } from './components/Scene/Scene';
import { Toolbar } from './components/UI/Toolbar';
import { ObjectList } from './components/UI/ObjectList';
import { SaveLoadControls } from './components/UI/SaveLoadControls';
import { SettingsPanel } from './components/UI/SettingsPanel';
import { StatusBar } from './components/UI/StatusBar';
import { CommandPalette } from './components/UI/CommandPalette';
import { NotificationSystem } from './components/UI/NotificationSystem';
import { useNotifications } from './hooks/useNotifications';
import { PrecisionInput } from './components/UI/PrecisionInput';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { useSceneState } from './hooks/useSceneState';
import './App.css';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const { notifications, addNotification, removeNotification } = useNotifications();

  const {
    objects,
    selectedObjectIds,
    selectedObjects,
    selectedObject,
    transformMode,
    settings,
    canUndo,
    canRedo,
    undo,
    redo,
    addObject,
    selectObjects,
    selectObject, // For compatibility
    updateObject,
    updateObjectMaterial,
    updateSettings,
    deleteObject,
    deleteSelectedObject,
    duplicateObject,
    setTransformMode,
    saveScene,
    loadScene,
    clearScene,
  } = useSceneState();

  // FPS tracking
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    updateFPS();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      // Undo/Redo shortcuts
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          if (canUndo) {
            const success = undo();
            if (success) {
              addNotification({
                type: 'success',
                message: 'Undo',
                duration: 1500,
              });
            }
          } else {
            addNotification({
              type: 'info',
              message: 'Nothing to undo',
              duration: 1500,
            });
          }
          return;
        }
        if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          if (canRedo) {
            const success = redo();
            if (success) {
              addNotification({
                type: 'success',
                message: 'Redo',
                duration: 1500,
              });
            }
          } else {
            addNotification({
              type: 'info',
              message: 'Nothing to redo',
              duration: 1500,
            });
          }
          return;
        }
      }

      // Close command palette on escape
      if (event.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
        return;
      }

      // Don't handle other shortcuts when command palette is open
      if (isCommandPaletteOpen) return;

      // Prevent default browser shortcuts when appropriate
      if (event.target instanceof HTMLInputElement) {
        return; // Don't handle shortcuts when typing in inputs
      }

      switch (event.key.toLowerCase()) {
        case 'delete':
        case 'backspace':
          event.preventDefault();
          deleteSelectedObject();
          break;
        case 'g':
          event.preventDefault();
          setTransformMode('translate');
          break;
        case 'r':
          event.preventDefault();
          setTransformMode('rotate');
          break;
        case 's':
          if (!event.ctrlKey) { // Avoid conflict with Ctrl+S (save)
            event.preventDefault();
            setTransformMode('scale');
          }
          break;
        case 'd':
          if (event.ctrlKey && selectedObject) {
            event.preventDefault();
            duplicateObject(selectedObject.id);
          }
          break;
        case 'escape':
          event.preventDefault();
          selectObject(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedObject, setTransformMode, selectObject, selectedObject, duplicateObject, saveScene, addNotification, isCommandPaletteOpen, setIsCommandPaletteOpen, undo, redo, canUndo, canRedo]);

  return (
    <div className={`app ${theme}`}>
      <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1>3D Scene Editor</h1>
              <span className="header-subtitle">Interactive 3D Design Tool</span>
            </div>
            <div className="header-right">
              <div className="header-stats">
                <span className="stat-item">
                  <span className="stat-label">Objects</span>
                  <span className="stat-value">{objects.length}</span>
                </span>
                <span className="stat-item">
                  <span className="stat-label">FPS</span>
                  <span className="stat-value">{fps}</span>
                </span>
              </div>
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </header>

        <div className="app-layout">
          <aside className="sidebar">
            <Toolbar
              onAddObject={(type) => {
                addObject(type);
                addNotification({
                  type: 'success',
                  title: 'Object Created',
                  message: `New ${type} added to the scene`,
                  duration: 3000,
                });
              }}
              onDeleteSelected={() => {
                if (selectedObject) {
                  deleteSelectedObject();
                  addNotification({
                    type: 'success',
                    title: 'Object Deleted',
                    message: `${selectedObject.type} has been removed`,
                    duration: 3000,
                  });
                }
              }}
              onDuplicateSelected={() => {
                if (selectedObject) {
                  duplicateObject(selectedObject.id);
                  addNotification({
                    type: 'success',
                    title: 'Object Duplicated',
                    message: `${selectedObject.type} has been duplicated`,
                    duration: 3000,
                  });
                }
              }}
              transformMode={transformMode}
              onSetTransformMode={setTransformMode}
              hasSelection={!!selectedObject}
            />

            <ObjectList
              objects={objects}
              selectedObjectId={selectedObject?.id || null}
              onSelectObject={selectObject}
              onDeleteObject={deleteObject}
              onDuplicateObject={duplicateObject}
              onUpdateObjectMaterial={updateObjectMaterial}
            />

            <PrecisionInput
              selectedObjects={selectedObjects}
              onUpdateObjects={(updates) => {
                selectedObjects.forEach(obj => {
                  updateObject(obj.id, updates);
                });
              }}
            />

            <SettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
            />

            <SaveLoadControls
              onSaveScene={() => {
                saveScene();
                addNotification({
                  type: 'success',
                  title: 'Scene Saved',
                  message: 'Your scene has been exported successfully',
                  duration: 3000,
                });
              }}
              onLoadScene={async (file) => {
                const success = await loadScene(file);
                addNotification({
                  type: success ? 'success' : 'error',
                  title: success ? 'Scene Loaded' : 'Load Failed',
                  message: success 
                    ? 'Scene has been loaded successfully'
                    : 'Failed to load the scene file. Please check the file format.',
                  duration: success ? 3000 : 5000,
                });
                return success;
              }}
              onClearScene={() => {
                if (objects.length > 0) {
                  clearScene();
                  addNotification({
                    type: 'warning',
                    title: 'Scene Cleared',
                    message: 'All objects have been removed from the scene',
                    duration: 3000,
                  });
                }
              }}
              objectCount={objects.length}
            />
          </aside>

          <main className="main-content">
            <div className="scene-container">
              <Scene
                objects={objects}
                selectedObjectIds={selectedObjectIds}
                transformMode={transformMode}
                settings={settings}
                onSelectObjects={selectObjects}
                onUpdateObject={updateObject}
              />
            </div>

            <StatusBar
              objects={objects}
              selectedObjects={selectedObjects}
              selectedObject={selectedObject}
              transformMode={transformMode}
              isGridSnap={settings.gridSnap}
              fps={fps}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </main>
        </div>

        {/* Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onAddObject={(type) => {
            addObject(type);
            addNotification({
              type: 'success',
              title: 'Object Created',
              message: `New ${type} added to the scene`,
              duration: 3000,
            });
          }}
          onDeleteSelected={deleteSelectedObject}
          onDuplicateSelected={() => selectedObject && duplicateObject(selectedObject.id)}
          onSetTransformMode={setTransformMode}
          onSaveScene={() => {
            saveScene();
            addNotification({
              type: 'success',
              title: 'Scene Saved',
              message: 'Your scene has been exported successfully',
              duration: 3000,
            });
          }}
          onClearScene={() => {
            if (objects.length > 0) {
              clearScene();
              addNotification({
                type: 'warning',
                title: 'Scene Cleared',
                message: 'All objects have been removed from the scene',
                duration: 3000,
              });
            }
          }}
          hasSelection={!!selectedObject}
        />

        {/* Notification System */}
        <NotificationSystem
          notifications={notifications}
          onRemove={removeNotification}
        />
      </div>
    );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
