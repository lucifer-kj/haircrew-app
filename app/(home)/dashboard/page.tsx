import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardClient from './dashboard-client'
import { Suspense } from 'react'

// Simple loading component for server-side rendering
function DashboardLoading() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="md:col-span-2 space-y-6">
              <div className="h-48 bg-slate-200 rounded-xl"></div>
              <div className="h-48 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div 
      className="min-h-screen py-12 px-4"
      style={{
        background: "linear-gradient(135deg, rgba(248,247,255,1) 0%, rgba(250,247,254,1) 35%, rgba(245,251,255,1) 100%)",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <Suspense fallback={<DashboardLoading />}>
          <DashboardClient 
            user={{
              id: user?.id || '',
              name: user?.name,
              email: user?.email,
              image: user?.image
            }}
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
        </Suspense>
      </div>
    </div>
  )
} 