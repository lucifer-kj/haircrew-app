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

  if (!user) {
    redirect('/auth/signin')
  }

  // Create a properly typed user object for the client component
  const userForClient = {
    id: user.id,
    name: user.name || '',
    email: user.email || ''
  }

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{
        background: "linear-gradient(135deg, rgba(248,247,255,1) 0%, rgba(250,247,254,1) 35%, rgba(245,251,255,1) 100%)",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <DashboardClient 
          user={userForClient}
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
    </div>
  )
} 