import Pusher from 'pusher-js';
import { env } from './env';

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  const key = env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.PUSHER_KEY;
  if (!key) {
    return null;
  }
  if (!pusherClient) {
    try {
      pusherClient = new Pusher(key, {
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
        channelAuthorization: {
          endpoint: '/api/pusher/auth',
          transport: 'ajax',
        },
      });
    } catch (err) {
      console.warn('Pusher client initialization failed:', err);
      return null;
    }
  }
  return pusherClient;
} 