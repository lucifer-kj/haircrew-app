import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { orderId, newStatus } = body as { orderId: string; newStatus: string };
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing orderId or newStatus' }, { status: 400 });
    }
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    // User action: "I've Paid"
    if (newStatus === 'PAID') {
      if (order.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'PROCESSING' },
      });
      // Real-time notification removed for serverless compatibility
      return NextResponse.json({ success: true, order: updated });
    }
    // Admin actions
    if ((session.user as { role?: string }).role === 'ADMIN') {
      let updateData: Prisma.OrderUpdateInput = {};
      if (newStatus === 'CONFIRMED') {
        updateData = { status: 'CONFIRMED' };
      } else if (newStatus === 'REFUNDED') {
        updateData = { status: 'REFUNDED', paymentStatus: 'REFUNDED' };
      } else if (newStatus === 'PROCESSING') {
        updateData = { status: 'PROCESSING' };
      } else {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      const updated = await prisma.order.update({ where: { id: orderId }, data: updateData });
      // Real-time notification removed for serverless compatibility
      if (newStatus === 'CONFIRMED') {
        await sendOrderConfirmationEmail(order.user.email, orderId);
      }
      return NextResponse.json({ success: true, order: updated });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
} 