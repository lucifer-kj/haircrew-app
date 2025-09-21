import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import {
  sendOrderConfirmationEmail,
  sendShippingUpdateEmail,
} from '@/lib/email'
import { Prisma } from '@prisma/client'
import { getPusherServer } from '@/lib/pusher-server'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { orderId, newStatus } = body as {
      orderId: string
      newStatus: string
    }
    if (!orderId || !newStatus) {
      return NextResponse.json(
        { error: 'Missing orderId or newStatus' },
        { status: 400 }
      )
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    // User action: "I've Paid"
    if (newStatus === 'PAID') {
      if (order.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'PROCESSING' },
      })
      // Pusher: Notify admin in real time
      await getPusherServer().trigger('orders', 'order-status-updated', {
        orderId,
        status: 'PAID',
        user: {
          id: order.userId,
          name: order.user.name,
          email: order.user.email,
        },
      })
      return NextResponse.json({ success: true, order: updated })
    }
    // Admin actions
    if (session.user.role === 'ADMIN') {
      let updateData: Prisma.OrderUpdateInput = {}
      let event: string | null = null
      if (newStatus === 'CONFIRMED') {
        updateData = { status: 'CONFIRMED' }
        event = 'order-confirmed'
      } else if (newStatus === 'REFUNDED') {
        updateData = { status: 'REFUNDED', paymentStatus: 'REFUNDED' }
        event = 'order-refunded'
      } else if (newStatus === 'PROCESSING') {
        updateData = { status: 'PROCESSING' }
        event = 'order-processing'
      } else if (newStatus === 'SHIPPED' || newStatus === 'DELIVERED') {
        updateData = { status: newStatus }
        event = 'order-shipping'
      } else {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
      })
      // Pusher: Notify user/admin of status change
      if (event) {
        await getPusherServer().trigger('orders', event, {
          orderId,
          status: newStatus,
          user: {
            id: order.userId,
            name: order.user.name,
            email: order.user.email,
          },
        })
      }
      if (newStatus === 'CONFIRMED') {
        await sendOrderConfirmationEmail(
          order.user.email,
          order.user.name || '',
          orderId
        )
      }
      // Placeholder: send shipping update email
      if (newStatus === 'SHIPPED' || newStatus === 'DELIVERED') {
        await sendShippingUpdateEmail(
          order.user.email,
          order.user.name || '',
          orderId,
          newStatus
        )
      }
      return NextResponse.json({ success: true, order: updated })
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
