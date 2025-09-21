import Pusher from 'pusher-js';
import { env } from './env';

let pusherClient: Pusher | null = null;

export function getPusherClient() {
  if (!pusherClient) {
    if (!env.NEXT_PUBLIC_PUSHER_APP_KEY) {
      throw new Error('NEXT_PUBLIC_PUSHER_APP_KEY is not configured');
    }
    pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      channelAuthorization: {
        endpoint: '/api/pusher/auth',
        transport: 'ajax',
      },
    });
  }
  return pusherClient;
} 