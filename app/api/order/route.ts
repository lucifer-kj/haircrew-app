export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { validateInput, orderSchema, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'
import { getPusherServer } from '@/lib/pusher-server'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { getShippingFee } from '@/lib/shipping'

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id || null

  try {
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(orderSchema, body)
    if (!validation.success) {
      Logger.validation('order_creation', body, userId || 'guest', {
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

    const {
      method,
      items,
      shipping,
      paymentReference,
      paymentReceiptUrl,
      guestEmail,
      guestName,
      guestPhone,
    } = validation.data

    // If no logged in user, require guest email
    const orderEmail = session?.user?.email || guestEmail
    const orderName = session?.user?.name || guestName || shipping.name
    const orderPhone = guestPhone || shipping.phone

    if (!userId && !orderEmail) {
      return NextResponse.json(
        { error: 'An email address is required for order confirmation.' },
        { status: 400 }
      )
    }

    // 1. Fetch products from database to get AUTHENTIC prices & verify stock
    const productIds = items.map((item: { id: string }) => item.id)
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        stock: true,
        name: true,
        price: true,
      },
    })

    if (dbProducts.length !== productIds.length) {
      const missingIds = productIds.filter(id => !dbProducts.some(p => p.id === id))
      return NextResponse.json(
        { error: `One or more products are unavailable: ${missingIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Check stock for all items
    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.id)
      if (!dbProduct) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 })
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} remaining.` },
          { status: 400 }
        )
      }
    }

    // 2. Compute authentic subtotal using DATABASE prices (preventing client price tampering)
    const verifiedItems = items.map(item => {
      const dbProduct = dbProducts.find(p => p.id === item.id)!
      const unitPrice = Number(dbProduct.price)
      return {
        id: item.id,
        quantity: item.quantity,
        price: unitPrice,
        name: dbProduct.name,
      }
    })

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingFee = getShippingFee(verifiedItems)
    const total = subtotal + shippingFee

    // 3. Determine payment & order status
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING
    if (method === 'UPI') {
      paymentStatus = PaymentStatus.AWAITING_VERIFICATION
    }

    // 4. Atomic transaction: create order and decrement stock
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: userId,
          guestEmail: !userId ? orderEmail : null,
          guestName: !userId ? orderName : null,
          guestPhone: !userId ? orderPhone : null,
          status: OrderStatus.PENDING,
          paymentStatus: paymentStatus,
          paymentMethod: method,
          paymentReference: paymentReference?.trim() || null,
          paymentReceiptUrl: paymentReceiptUrl?.trim() || null,
          total: total,
          subtotal: subtotal,
          shipping: shippingFee,
          currency: 'INR',
          shippingAddress: {
            name: sanitizeInput(shipping.name),
            phone: shipping.phone,
            address: sanitizeInput(shipping.address),
            city: sanitizeInput(shipping.city),
            state: sanitizeInput(shipping.state),
            pincode: shipping.pincode,
            country: sanitizeInput(shipping.country || 'India'),
          },
          orderItems: {
            create: verifiedItems.map(item => ({
              product: { connect: { id: item.id } },
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { orderItems: true },
      })

      // Decrement stock atomically
      await Promise.all(
        verifiedItems.map(item =>
          tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          })
        )
      )

      return order
    })

    Logger.order('created', result.id, userId || 'guest', {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })

    // 5. Non-blocking side effects (Pusher and Email)
    try {
      const pusher = getPusherServer()
      if (pusher) {
        await pusher.trigger('orders', 'new-order', {
          orderId: result.id,
          orderNumber: result.orderNumber,
          user: { id: userId, name: orderName, email: orderEmail },
          total: result.total,
          paymentStatus: result.paymentStatus,
          paymentMethod: result.paymentMethod,
          createdAt: result.createdAt,
        })
      }
    } catch (pusherErr: any) {
      Logger.warn('Pusher notification skipped', { error: pusherErr?.message })
    }

    if (orderEmail) {
      try {
        await sendOrderConfirmationEmail(orderEmail, orderName ?? '', result.id)
      } catch (emailErr: any) {
        Logger.warn('Order confirmation email skipped', { error: emailErr?.message })
      }
    }

    return NextResponse.json(
      {
        id: result.id,
        orderNumber: result.orderNumber,
        total: result.total,
        paymentStatus: result.paymentStatus,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order processing failed:', error)
    Logger.error('Order creation failed', error as Error, {
      userId: userId || 'guest',
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Order processing failed. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: { select: { name: true, images: true, slug: true } },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Permission check: owner user, admin, or matching guest email
    const isOwner = userId && order.userId === userId
    const isAdmin = session?.user?.role === 'ADMIN'
    const isGuestOwner = email && order.guestEmail?.toLowerCase() === email.toLowerCase()

    if (!isOwner && !isAdmin && !isGuestOwner) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 })
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
      paymentReceiptUrl: order.paymentReceiptUrl,
      orderItems: order.orderItems,
      shippingAddress: order.shippingAddress,
      guestEmail: order.guestEmail,
      guestName: order.guestName,
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
  const isAdmin = session.user.role === 'ADMIN'

  try {
    const body = await req.json()
    const { orderId, newStatus } = body
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Order ID and newStatus are required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Authorization check: non-admin can ONLY cancel their own order
    if (!isAdmin) {
      if (order.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (newStatus !== 'CANCELLED') {
        return NextResponse.json({ error: 'Customers can only cancel pending orders.' }, { status: 403 })
      }
      if (order.status !== 'PENDING') {
        return NextResponse.json({ error: 'Only pending orders can be cancelled.' }, { status: 400 })
      }
    }

    // Cancel and Restock
    if (newStatus === 'CANCELLED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
      await prisma.$transaction(async (tx) => {
        await Promise.all(
          order.orderItems.map(item =>
            tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          )
        )
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        })
      })

      Logger.order('restocked_on_cancel', orderId, userId, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json({ success: true, message: 'Order cancelled and inventory restocked.' })
    }

    // Admin status update
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized status transition' }, { status: 403 })
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as OrderStatus },
    })

    Logger.order('status_updated', orderId, userId, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ success: true, order: updated })
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
