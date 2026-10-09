import Pusher from 'pusher';
import { env } from './env';

let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (!pusherServer) {
    const appId = env.PUSHER_APP_ID || process.env.PUSHER_APP_ID;
    const key = env.PUSHER_KEY || process.env.PUSHER_KEY;
    const secret = env.PUSHER_SECRET || process.env.PUSHER_SECRET;
    const cluster = env.PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || 'ap2';

    if (!appId || !key || !secret) {
      return null;
    }
    try {
      pusherServer = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      });
    } catch (err) {
      console.warn('Failed to initialize Pusher server:', err);
      return null;
    }
  }
  return pusherServer;
} 