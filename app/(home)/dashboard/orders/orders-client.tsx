"use client"

import { motion } from "framer-motion"
import { PackageSearch, ExternalLink } from "lucide-react"
import Link from "next/link"
import { GlassCard, GlassBadge } from "@/components/ui/glass-card"

// Order status badge with glass effect
function OrderStatusBadge({ status }: { status: string }) {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success'
      case 'shipped': return 'info'
      case 'processing': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  return (
    <GlassBadge variant={getVariant(status)}>
      {status}
    </GlassBadge>
  )
}

interface OrderItem {
  id: string
  productId: string
  orderId: string
  quantity: number
  price: string
  createdAt: string
  product?: {
    name: string
    images: string[]
    slug: string
  }
}

interface Order {
  id: string
  orderNumber: string
  total: string
  status: string
  createdAt: string
  orderItems: OrderItem[]
}

interface OrdersClientProps {
  orders: Order[]
}

export default function OrdersClient({ orders }: OrdersClientProps) {
  // Format currency
  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(Number(value))
  }

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{
        background: "linear-gradient(135deg, rgba(248,247,255,1) 0%, rgba(250,247,254,1) 35%, rgba(245,251,255,1) 100%)",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto max-w-5xl">
        <GlassCard className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <PackageSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Your Orders
              </h1>
              <p className="text-slate-600 mt-1">Track and manage your purchases</p>
            </div>
          </div>
        </GlassCard>
        
        {orders.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <PackageSearch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No orders found</p>
            <p className="text-slate-500 mt-2">Your order history will appear here once you make a purchase.</p>
            <Link href="/products" className="mt-6 inline-flex items-center text-primary font-medium">
              Browse Products
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <motion.div
                key={order.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Order header */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-slate-500 mb-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                    </div>
                    
                    {/* Order actions */}
                    <div className="shrink-0 flex md:flex-col justify-end gap-3">
                      <Link 
                        href={`/order-received/${order.id}`}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  {/* Order items */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200/20">
                      <p className="text-sm font-medium text-slate-600 mb-3">Products</p>
                      <div className="space-y-3">
                        {order.orderItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div 
                              className="h-12 w-12 bg-center bg-cover rounded-md"
                              style={{
                                backgroundImage: `url(${
                                  item.product?.images?.[0] || '/placeholder.jpg'
                                })`
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.product?.name}</p>
                              <p className="text-xs text-slate-500">
                                {formatCurrency(item.price)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 