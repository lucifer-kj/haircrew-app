import Pusher from 'pusher';
import { env } from './env';

let pusherServer: Pusher | null = null;

export function getPusherServer() {
  if (!pusherServer) {
    if (!env.PUSHER_APP_ID || !env.PUSHER_KEY || !env.PUSHER_SECRET) {
      throw new Error('Pusher configuration is missing');
    }
    pusherServer = new Pusher({
      appId: env.PUSHER_APP_ID,
      key: env.PUSHER_KEY,
      secret: env.PUSHER_SECRET,
      cluster: env.PUSHER_CLUSTER || 'us2',
      useTLS: true,
    });
  }
  return pusherServer;
} 