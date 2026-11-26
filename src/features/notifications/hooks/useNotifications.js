import { useContext } from 'react';
import { NotificationContext } from './NotificationContext.js';

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) throw new Error('useNotifications harus digunakan di dalam NotificationsProvider.');
  return value;
}
