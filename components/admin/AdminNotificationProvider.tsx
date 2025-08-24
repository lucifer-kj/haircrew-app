'use client';
import { useEffect, useState, createContext, useContext } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { Notification as NotificationType } from '@/types/notification';

const AdminNotificationContext = createContext<NotificationType[]>([]);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [notificationsEnabled] = useState<boolean>(true); // You may want to set this from user settings or props

  useEffect(() => {
    if (!notificationsEnabled) {
      // Fallback: notifications are disabled
      return;
    }
    const channel = pusherClient.subscribe('presence-admin-dashboard');
    channel.bind('admin-notification', (data: NotificationType) => {
      setNotifications((prev: NotificationType[]) => [data, ...prev.slice(0, 49)]);
    });
    // Error handling for Pusher connection failures
    pusherClient.connection.bind('error', (err: unknown) => {
      // Use your structured logger here if available
      if (typeof window !== 'undefined' && window.console) {
        console.error('Pusher connection error', err);
      }
    });
    pusherClient.connection.bind('state_change', (states: unknown) => {
      if (
        typeof states === 'object' &&
        states !== null &&
        'current' in states &&
        (states as { current: string }).current === 'disconnected'
      ) {
        if (typeof window !== 'undefined' && window.console) {
          console.warn('Pusher disconnected');
        }
      }
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusherClient.connection.unbind('error');
      pusherClient.connection.unbind('state_change');
    };
  }, [notificationsEnabled]);

  return (
    <AdminNotificationContext.Provider value={notifications}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  return useContext(AdminNotificationContext);
} 