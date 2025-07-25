import Pusher from 'pusher-js';

export const pusherClient = new Pusher(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, // This must be defined
  {
    cluster: 'us2',
    channelAuthorization: {
      endpoint: '/api/pusher/auth',
      transport: 'ajax',
    },
  }
); 