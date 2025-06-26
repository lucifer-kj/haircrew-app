import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { OrderStatus, PaymentStatus } from "@prisma/client"

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
        userId,
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
    return NextResponse.json({ id: order.id }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
} 