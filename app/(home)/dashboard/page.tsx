import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      orders: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      },
      addresses: true,
      wishlists: {
        include: {
          product: true
        },
        take: 6
      }
    },
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Client Component for Interactive Features */}
      <DashboardClient 
        user={user}
        initialOrders={(user?.orders || []).map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          orderItems: order.orderItems?.map(item => ({
            id: item.id,
            product: item.product ? { name: item.product.name } : undefined,
            name: item.product?.name,
            price: item.price.toString(),
            quantity: item.quantity
          }))
        }))}
        initialAddresses={user?.addresses || []}
        initialWishlist={user?.wishlists || []}
      />
    </div>
  )
} 