'use client';
import { useAdminNotifications } from './AdminNotificationProvider';

export default function AdminNotificationsPanel() {
  const notifications = useAdminNotifications();

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 max-w-full bg-white shadow-lg rounded-lg z-50">
      <div className="p-4 border-b font-bold">Admin Notifications</div>
      <ul className="max-h-96 overflow-y-auto">
        {notifications.map((n) => (
          <li key={n.id} className="p-4 border-b last:border-b-0">
            <div className="font-semibold">{n.type}</div>
            <div>{n.message}</div>
            <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
} 