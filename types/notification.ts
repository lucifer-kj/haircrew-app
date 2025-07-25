export interface Notification {
  id: string;
  type: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
} 