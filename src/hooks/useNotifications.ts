import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 2000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [removeNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};
