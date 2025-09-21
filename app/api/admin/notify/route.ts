import { NextRequest, NextResponse } from 'next/server';
import { getPusherServer } from '@/lib/pusher-server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, message, data } = body;

  // Save to DB
  const notification = await prisma.notification.create({
    data: { type, message, data },
  });

  // Broadcast to admin channel
  await getPusherServer().trigger('presence-admin-dashboard', 'admin-notification', {
    id: notification.id,
    type,
    message,
    data,
    createdAt: notification.createdAt,
  });

  return NextResponse.json({ success: true });
} 