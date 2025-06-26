import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "../dashboard-client"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
    }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Get user data for dashboard
  const [ordersRaw, addresses, wishlist] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.address.findMany({
      where: { userId: user.id }
    }),
    prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Convert Date fields to string for orders
  const orders = ordersRaw.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    orderItems: order.orderItems?.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      price: item.price.toString(),
    }))
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>
      
      <DashboardClient 
        user={user}
        initialOrders={orders}
        initialAddresses={addresses}
        initialWishlist={wishlist}
      />
    </div>
  )
} 