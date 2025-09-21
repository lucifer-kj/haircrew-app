import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrdersClient from './orders-client'
import { serializeOrder } from '@/types/dashboard'
import type { Session } from 'next-auth'

export default async function OrdersPage() {
  const session: Session | null = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/dashboard/user')
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

  // Use type-safe serialization function
  const serializedOrders = orders.map(serializeOrder)

  return <OrdersClient orders={serializedOrders} />
}
