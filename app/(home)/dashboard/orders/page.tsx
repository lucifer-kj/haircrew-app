import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import OrdersClient from "./orders-client"
import { Suspense } from "react"

// Simple loading component for server-side rendering
function OrdersLoading() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-5xl">
        <div className="animate-pulse">
          <div className="h-24 bg-slate-200 rounded-xl mb-8"></div>
          <div className="space-y-6">
            <div className="h-40 bg-slate-200 rounded-xl"></div>
            <div className="h-40 bg-slate-200 rounded-xl"></div>
            <div className="h-40 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function OrdersPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) {
    redirect("/auth/signin")
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
              slug: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Convert orders to serializable format
  const serializedOrders = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    total: order.total.toString(),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      productId: item.productId,
      orderId: item.orderId,
      price: item.price.toString(),
      quantity: item.quantity,
      createdAt: item.createdAt.toISOString(),
      product: item.product ? {
        name: item.product.name,
        images: item.product.images,
        slug: item.product.slug
      } : undefined,
      name: item.product?.name
    }))
  }))

  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersClient orders={serializedOrders} />
    </Suspense>
  )
} 