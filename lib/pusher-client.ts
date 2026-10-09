import Pusher from 'pusher-js';
import { env } from './env';

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (!env.NEXT_PUBLIC_PUSHER_APP_KEY) {
    return null;
  }
  if (!pusherClient) {
    try {
      pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
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