import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminOrdersClient from './admin-orders-client'
import { serializeOrder } from '@/types/dashboard'

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: {
          product: { select: { name: true, images: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  
  // Serialize for client with user data
  const serializedOrders = orders.map(order => ({
    ...serializeOrder(order),
    user: {
      name: order.user.name || '',
      email: order.user.email || '',
    },
  }))
  
  return <AdminOrdersClient orders={serializedOrders} />
}
