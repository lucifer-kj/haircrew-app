export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { validateInput, orderSchema, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'
import { pusherServer } from '@/lib/pusher'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { getShippingFee } from '@/lib/shipping'

// These interfaces are now defined in the validation schema

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    // Defensive check: ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      Logger.warn('Order creation attempted with invalid user', {
        userId,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        { error: 'User not found. Please sign in again.' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(orderSchema, body)
    if (!validation.success) {
      Logger.validation('order_creation', body, userId, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    const { method, status, items, shipping } = validation.data
    // Calculate subtotal, shipping, total
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const shippingFee = getShippingFee(items)
    const total = subtotal + shippingFee
    // Map status
    let orderStatus: OrderStatus = OrderStatus.PENDING
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING
    if (status === 'pending') {
      orderStatus = OrderStatus.PENDING
      paymentStatus = PaymentStatus.PENDING
    } else if (status === 'payment_pending_confirmation') {
      orderStatus = OrderStatus.PROCESSING
      paymentStatus = PaymentStatus.PENDING
    }
    // Sanitize shipping address
    const sanitizedShipping = {
      name: sanitizeInput(shipping.name),
      phone: shipping.phone,
      address: sanitizeInput(shipping.address),
      city: sanitizeInput(shipping.city),
      state: sanitizeInput(shipping.state),
      pincode: shipping.pincode,
      country: sanitizeInput(shipping.country || 'India'),
    }

    // Save order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: userId,
        status: orderStatus,
        paymentStatus,
        paymentMethod: method,
        total,
        subtotal,
        shipping: shippingFee,
        currency: 'INR',
        shippingAddress: JSON.parse(JSON.stringify(sanitizedShipping)),
        createdAt: new Date(),
        orderItems: {
          create: items.map(item => ({
            product: { connect: { id: item.id } },
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { orderItems: true },
    })

    Logger.order('created', order.id, userId, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })

    // Pusher: Notify admin of new order
    await pusherServer.trigger('orders', 'new-order', {
      orderId: order.id,
      user: { id: user.id, name: user.name, email: user.email },
      total: order.total,
      createdAt: order.createdAt,
    })
    // Send order confirmation email
    await sendOrderConfirmationEmail(user.email, user.name ?? '', order.id)
    return NextResponse.json({ id: order.id }, { status: 201 })
  } catch (e) {
    Logger.error('Order creation failed', e as Error, {
      userId,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    })
    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderItems: order.orderItems,
      shippingAddress: order.shippingAddress,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
