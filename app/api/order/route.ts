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
    // 1. Verify stock availability
    const productIds = items.map((item: { id: string }) => item.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, name: true },
    })
    for (const item of items) {
      const product = products.find(p => p.id === item.id)
      if (!product) {
        console.error(`Product not found: ${item.id}`)
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        console.error(`Insufficient stock for product: ${product.name}`)
        return NextResponse.json({ error: `Insufficient stock for product: ${product.name}` }, { status: 400 })
      }
    }

    // 2. Process order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // a. Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: userId,
          status: status === 'pending' ? OrderStatus.PENDING : OrderStatus.PROCESSING,
          paymentStatus: status === 'pending' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
          paymentMethod: method,
          total: items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0),
          subtotal: items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0),
          shipping: getShippingFee(items),
          currency: 'INR',
          shippingAddress: JSON.parse(JSON.stringify({
            name: sanitizeInput(shipping.name),
            phone: shipping.phone,
            address: sanitizeInput(shipping.address),
            city: sanitizeInput(shipping.city),
            state: sanitizeInput(shipping.state),
            pincode: shipping.pincode,
            country: sanitizeInput(shipping.country || 'India'),
          })),
          createdAt: new Date(),
          orderItems: {
            create: items.map((item: { id: string; quantity: number; price: number }) => ({
              product: { connect: { id: item.id } },
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { orderItems: true },
      })
      // b. Reduce stock
      await Promise.all(items.map((item: { id: string; quantity: number }) =>
        tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        })
      ))
      return order
    })

    Logger.order('created', result.id, userId, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    await pusherServer.trigger('orders', 'new-order', {
      orderId: result.id,
      user: { id: user.id, name: user.name, email: user.email },
      total: result.total,
      createdAt: result.createdAt,
    })
    await sendOrderConfirmationEmail(user.email, user.name ?? '', result.id)
    return NextResponse.json({ id: result.id }, { status: 201 })
  } catch (error) {
    console.error('Order processing failed:', error)
    Logger.error('Order creation failed', error as Error, {
      userId,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Order processing failed' },
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

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await req.json()
    const { orderId, newStatus } = body
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Order ID and newStatus are required' }, { status: 400 })
    }
    // Fetch order and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    // Only allow restock if not shipped/delivered
    if (
      newStatus === 'CANCELLED' &&
      order.status !== 'SHIPPED' &&
      order.status !== 'DELIVERED'
    ) {
      await prisma.$transaction(async (tx) => {
        // Restock each product
        await Promise.all(
          order.orderItems.map(item =>
            tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          )
        )
        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        })
      })
      Logger.order('restocked_on_cancel', orderId, userId, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json({ success: true, message: 'Order cancelled and products restocked.' })
    } else {
      // Just update status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      })
      Logger.order('status_updated', orderId, userId, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json({ success: true, message: 'Order status updated.' })
    }
  } catch (error) {
    console.error('Order status update failed:', error)
    Logger.error('Order status update failed', error as Error, {
      userId,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Order status update failed' },
      { status: 500 }
    )
  }
}
