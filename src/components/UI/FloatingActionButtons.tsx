import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface FloatingActionButtonsProps {
  onAddCube: () => void;
  onAddSphere: () => void;
  onToggleGrid: () => void;
  onToggleShadows: () => void;
  onSaveScene: () => void;
  onLoadScene: () => void;
  showGrid: boolean;
  showShadows: boolean;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onAddCube,
  onAddSphere,
  onToggleGrid,
  onToggleShadows,
  onSaveScene,
  onLoadScene,
  showGrid,
  showShadows,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Close menu when clicking outside or on escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.floating-actions')) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const actions = [
    {
      icon: '⬛',
      label: 'Add Cube',
      action: () => handleAction(onAddCube),
    },
    {
      icon: '⚫',
      label: 'Add Sphere',
      action: () => handleAction(onAddSphere),
    },
    {
      icon: showGrid ? '📐' : '�',
      label: showGrid ? 'Hide Grid' : 'Show Grid',
      action: () => handleAction(onToggleGrid),
    },
    {
      icon: showShadows ? '☀️' : '🌙',
      label: showShadows ? 'Disable Shadows' : 'Enable Shadows',
      action: () => handleAction(onToggleShadows),
    },
    {
      icon: theme === 'light' ? '🌙' : '☀️',
      label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'}`,
      action: () => handleAction(toggleTheme),
    },
    {
      icon: '💾',
      label: 'Save Scene',
      action: () => handleAction(onSaveScene),
    },
    {
      icon: '📁',
      label: 'Load Scene',
      action: () => handleAction(onLoadScene),
    },
  ];

  return (
    <div className="floating-actions">
      <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
        {actions.map((action, index) => (
          <button
            key={index}
            className="fab-item"
            onClick={(e) => {
              e.stopPropagation();
              action.action();
            }}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="icon">{action.icon}</span>
            <span className="label">{action.label}</span>
          </button>
        ))}
      </div>
      
      <button
        className={`fab-main ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
      >
        ⚡
      </button>
    </div>
  );
};
