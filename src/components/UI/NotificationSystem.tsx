import React, { useEffect } from 'react';
import type { Notification } from '../../hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
}) => {
  useEffect(() => {
    const duration = notification.duration || 2000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

  return (
    <div 
      className={`notification ${notification.type}`}
      onClick={() => onRemove(notification.id)}
    >
      <span className="notification-icon">{getIcon()}</span>
      <div className="notification-content">
        {notification.title && (
          <span className="notification-title">{notification.title}</span>
        )}
        <span className="notification-message">{notification.message}</span>
      </div>
    </div>
  );
};

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemove,
}) => {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};