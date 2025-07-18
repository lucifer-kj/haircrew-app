import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrdersClient from './orders-client'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Convert dates to strings for client component
  const serializedOrders = orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    total: order.total.toString(),
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      productId: item.productId,
      orderId: item.orderId,
      quantity: item.quantity,
      price: item.price.toString(),
      createdAt: item.createdAt.toISOString(),
      product: item.product
        ? {
            name: item.product.name,
            images: item.product.images,
            slug: item.product.slug,
          }
        : undefined,
    })),
  }))

  return <OrdersClient orders={serializedOrders} />
}
