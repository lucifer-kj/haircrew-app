import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import {
  sendOrderConfirmationEmail,
  sendShippingUpdateEmail,
} from '@/lib/email'
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client'
import { getPusherServer } from '@/lib/pusher-server'
import Logger from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, newStatus, paymentReference, paymentReceiptUrl } = body as {
      orderId: string
      newStatus?: string
      paymentReference?: string
      paymentReceiptUrl?: string
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = order.userId === session.user.id

    // Customer action: Submitting or updating UTR reference / payment proof
    if (paymentReference || paymentReceiptUrl) {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentReference: paymentReference?.trim() || order.paymentReference,
          paymentReceiptUrl: paymentReceiptUrl?.trim() || order.paymentReceiptUrl,
          paymentStatus: PaymentStatus.AWAITING_VERIFICATION,
        },
      })

      try {
        const pusher = getPusherServer()
        if (pusher) {
          await pusher.trigger('orders', 'payment-submitted', {
            orderId,
            status: updated.paymentStatus,
            reference: updated.paymentReference,
          })
        }
      } catch (err: any) {
        Logger.warn('Pusher payment-submitted error', { error: err?.message })
      }

      return NextResponse.json({
        success: true,
        message: 'Payment proof submitted. Awaiting verification.',
        order: updated,
      })
    }

    // ALL status changes beyond submitting UTR REQUIRE ADMIN PRIVILEGES
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Customers cannot alter order fulfillment or payment status directly.' },
        { status: 403 }
      )
    }

    if (!newStatus) {
      return NextResponse.json({ error: 'Missing newStatus' }, { status: 400 })
    }

    let updateData: Prisma.OrderUpdateInput = {}
    let event: string | null = null

    switch (newStatus) {
      case 'PAID':
      case 'CONFIRMED':
        updateData = {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
        }
        event = 'order-confirmed'
        break
      case 'PROCESSING':
        updateData = { status: OrderStatus.PROCESSING }
        event = 'order-processing'
        break
      case 'SHIPPED':
        updateData = { status: OrderStatus.SHIPPED }
        event = 'order-shipping'
        break
      case 'DELIVERED':
        updateData = { status: OrderStatus.DELIVERED }
        event = 'order-delivered'
        break
      case 'REFUNDED':
        updateData = {
          status: OrderStatus.REFUNDED,
          paymentStatus: PaymentStatus.REFUNDED,
        }
        event = 'order-refunded'
        break
      case 'PAYMENT_FAILED':
        updateData = { paymentStatus: PaymentStatus.FAILED }
        event = 'order-payment-failed'
        break
      default:
        return NextResponse.json({ error: `Invalid status: ${newStatus}` }, { status: 400 })
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    const customerEmail = order.user?.email || order.guestEmail
    const customerName = order.user?.name || order.guestName || 'Valued Customer'

    // Non-blocking real-time notification
    try {
      const pusher = getPusherServer()
      if (pusher && event) {
        await pusher.trigger('orders', event, {
          orderId,
          status: newStatus,
          user: {
            id: order.userId,
            name: customerName,
            email: customerEmail,
          },
        })
      }
    } catch (err: any) {
      Logger.warn('Pusher status update skipped', { error: err?.message })
    }

    // Non-blocking email notifications
    if (customerEmail) {
      try {
        if (newStatus === 'CONFIRMED' || newStatus === 'PAID') {
          await sendOrderConfirmationEmail(customerEmail, customerName, orderId)
        } else if (newStatus === 'SHIPPED' || newStatus === 'DELIVERED') {
          await sendShippingUpdateEmail(customerEmail, customerName, orderId, newStatus)
        }
      } catch (err: any) {
        Logger.warn('Email notification skipped', { error: err?.message })
      }
    }

    return NextResponse.json({ success: true, order: updated })
  } catch (e: any) {
    console.error('Order status update error:', e)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
