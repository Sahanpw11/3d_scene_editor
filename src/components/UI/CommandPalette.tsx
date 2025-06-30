import React, { useState, useEffect, useRef } from 'react';
import type { ObjectType } from '../../types/scene';

interface Command {
  id: string;
  name: string;
  description: string;
  shortcut?: string;
  category: string;
  action: () => void;
  icon: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddObject: (type: ObjectType) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onSetTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  onSaveScene: () => void;
  onClearScene: () => void;
  hasSelection: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onAddObject,
  onDeleteSelected,
  onDuplicateSelected,
  onSetTransformMode,
  onSaveScene,
  onClearScene,
  hasSelection,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'add-cube',
      name: 'Add Cube',
      description: 'Create a new cube in the scene',
      category: 'Create',
      icon: '⬛',
      action: () => onAddObject('cube'),
    },
    {
      id: 'add-sphere',
      name: 'Add Sphere',
      description: 'Create a new sphere in the scene',
      category: 'Create',
      icon: '⚫',
      action: () => onAddObject('sphere'),
    },
    {
      id: 'move-mode',
      name: 'Move Mode',
      description: 'Switch to translate/move mode',
      shortcut: 'G',
      category: 'Transform',
      icon: '↔️',
      action: () => onSetTransformMode('translate'),
    },
    {
      id: 'rotate-mode',
      name: 'Rotate Mode',
      description: 'Switch to rotation mode',
      shortcut: 'R',
      category: 'Transform',
      icon: '🔄',
      action: () => onSetTransformMode('rotate'),
    },
    {
      id: 'scale-mode',
      name: 'Scale Mode',
      description: 'Switch to scale mode',
      shortcut: 'S',
      category: 'Transform',
      icon: '📏',
      action: () => onSetTransformMode('scale'),
    },
    {
      id: 'delete-selected',
      name: 'Delete Selected',
      description: 'Delete the selected object',
      shortcut: 'Del',
      category: 'Edit',
      icon: '🗑️',
      action: onDeleteSelected,
    },
    {
      id: 'duplicate-selected',
      name: 'Duplicate Selected',
      description: 'Duplicate the selected object',
      shortcut: 'Ctrl+D',
      category: 'Edit',
      icon: '📋',
      action: onDuplicateSelected,
    },
    {
      id: 'save-scene',
      name: 'Save Scene',
      description: 'Save the current scene to file',
      shortcut: 'Ctrl+S',
      category: 'File',
      icon: '💾',
      action: onSaveScene,
    },
    {
      id: 'clear-scene',
      name: 'Clear Scene',
      description: 'Remove all objects from the scene',
      category: 'File',
      icon: '🗑️',
      action: onClearScene,
    },
  ];

  const filteredCommands = commands.filter(command => {
    // Filter out commands that require selection when nothing is selected
    if ((command.id === 'delete-selected' || command.id === 'duplicate-selected') && !hasSelection) {
      return false;
    }
    
    return command.name.toLowerCase().includes(query.toLowerCase()) ||
           command.description.toLowerCase().includes(query.toLowerCase()) ||
           command.category.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const executeCommand = (command: Command) => {
    command.action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay">
      <div className="command-palette">
        <div className="command-search">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="command-input"
          />
          <span className="search-hint">⌨️ Use ↑↓ to navigate, Enter to execute</span>
        </div>

        <div className="command-results">
          {filteredCommands.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <p>No commands found</p>
              <small>Try a different search term</small>
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => executeCommand(command)}
              >
                <div className="command-icon">{command.icon}</div>
                <div className="command-content">
                  <div className="command-name">{command.name}</div>
                  <div className="command-description">{command.description}</div>
                </div>
                <div className="command-meta">
                  <span className="command-category">{command.category}</span>
                  {command.shortcut && (
                    <span className="command-shortcut">{command.shortcut}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="command-footer">
          <div className="command-tips">
            <span>💡 Pro tip: Use keyboard shortcuts for faster access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
