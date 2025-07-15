export const runtime = 'nodejs'
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { pusherServer } from '@/lib/pusher';
import { sendOrderConfirmationEmail } from '@/lib/email';

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface ShippingInfo {
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
}

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    // Defensive check: ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found. Please sign in again." }, { status: 401 })
    }
    const body = await req.json()
    const { method, status, items, /* amount, */ shipping, createdAt } = body as {
      method: string
      status: string
      items: OrderItem[]
      /* amount: number */
      shipping: ShippingInfo
      createdAt: string
    }
    // Calculate subtotal, shipping, total
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingFee = 0 // You can add logic for shipping fee
    const total = subtotal + shippingFee
    // Map status
    let orderStatus: OrderStatus = OrderStatus.PENDING
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING
    if (status === "pending") {
      orderStatus = OrderStatus.PENDING
      paymentStatus = PaymentStatus.PENDING
    } else if (status === "payment_pending_confirmation") {
      orderStatus = OrderStatus.PENDING
      paymentStatus = PaymentStatus.PENDING
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
        currency: "INR",
        shippingAddress: JSON.parse(JSON.stringify(shipping)),
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        orderItems: {
          create: items.map((item) => ({
            product: { connect: { id: item.id } },
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { orderItems: true },
    })
    // Pusher: Notify admin of new order
    await pusherServer.trigger('orders', 'new-order', {
      orderId: order.id,
      user: { id: user.id, name: user.name, email: user.email },
      total: order.total,
      createdAt: order.createdAt,
    });
    // Send order confirmation email
    await sendOrderConfirmationEmail(user.email, user.name || '', order.id);
    return NextResponse.json({ id: order.id }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    })
    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
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
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
} 