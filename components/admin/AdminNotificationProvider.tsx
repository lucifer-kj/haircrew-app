'use client';
import { useEffect, useState, createContext, useContext } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { Notification as NotificationType } from '@/types/notification';

const AdminNotificationContext = createContext<NotificationType[]>([]);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    const channel = pusherClient.subscribe('presence-admin-dashboard');
    channel.bind('admin-notification', (data: NotificationType) => {
    setNotifications((prev: NotificationType[]) => [data, ...prev.slice(0, 49)]);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <AdminNotificationContext.Provider value={notifications}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  return useContext(AdminNotificationContext);
} 