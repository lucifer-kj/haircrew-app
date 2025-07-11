"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { 
  User, MapPin, Heart, 
  Star, CreditCard, ChevronRight, ShoppingBag
} from 'lucide-react'
import { Decimal } from '@prisma/client/runtime/library'
import { GlassCard, GlassButton, GlassBadge } from "@/components/ui/glass-card"

// Define interfaces
interface Order {
  id: string
  orderNumber: string
  total: Decimal
  status: string
  createdAt: string
  orderItems?: Array<{
    id: string
    product?: { name: string }
    name?: string
    price: string | number
    quantity: number
  }>
}

interface Address {
  id: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: Decimal
    images: string[]
    slug: string
  }
}

interface DashboardClientProps {
  user: {
    name?: string
    email?: string
    id: string
  }
  initialOrders: Order[]
  initialAddresses: Address[]
  initialWishlist: WishlistItem[]
}

export default function DashboardClient({ 
  user, 
  initialOrders, 
  initialAddresses, 
  initialWishlist 
}: DashboardClientProps) {
  const [orders] = useState<Order[]>(initialOrders)
  const [addresses] = useState<Address[]>(initialAddresses)
  const [wishlist] = useState<WishlistItem[]>(initialWishlist)
  const router = useRouter()

  const menuItems = [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Dashboard summary',
      icon: User,
      href: '/dashboard',
      stats: null
    },
    {
      id: 'orders',
      title: 'Orders',
      description: 'View your order history',
      icon: ShoppingBag,
      href: '/dashboard/orders',
      stats: orders.length
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      description: 'Your saved items',
      icon: Heart,
      href: '/dashboard/wishlist',
      stats: wishlist.length
    },
    {
      id: 'addresses',
      title: 'Addresses',
      description: 'Manage shipping addresses',
      icon: MapPin,
      href: '/dashboard/addresses',
      stats: addresses.length
    },
    {
      id: 'reviews',
      title: 'Reviews',
      description: 'Your product reviews',
      icon: Star,
      href: '/dashboard/reviews',
      stats: null
    },
    {
      id: 'payments',
      title: 'Payments',
      description: 'Payment methods & history',
      icon: CreditCard,
      href: '/dashboard/payments',
      stats: null
    }
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  // Format currency
  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(Number(value))
  }

  return (
    <div className="w-full space-y-8">
      {/* User Welcome Banner - Liquid glass effect */}
      <GlassCard gradient={true} gradientColors="from-primary/30 to-secondary/20">
        <div className="px-6 py-8 text-center md:text-left md:flex md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Hello, {user?.name || 'User'}
            </h1>
            <p className="mt-1 text-white/80">Welcome to your dashboard</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-md rounded-full px-5 py-2 text-white font-medium shadow-inner">
              {initialOrders.length} Orders • {initialWishlist.length} Saved Items
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Navigation Menu */}
        <div className="md:col-span-1">
          <div className="space-y-3">
            {menuItems.map((item) => (
              <GlassCard 
                key={item.id}
                gradient={item.id === 'overview'}
                onClick={() => handleNavigate(item.href)}
                className="bg-white dark:bg-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2.5 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-md text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{item.title}</h3>
                      {item.stats !== null && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.stats} {item.id}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Content - Recent Activity */}
        <div className="md:col-span-2 space-y-6">
          {/* Recent Orders Preview */}
          {orders.length > 0 && (
            <GlassCard className="bg-white dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Recent Orders
                </h2>
                <GlassButton 
                  onClick={() => handleNavigate('/dashboard/orders')}
                >
                  View all
                </GlassButton>
              </div>

              <div className="space-y-4">
                {orders.slice(0, 3).map(order => (
                  <div 
                    key={order.id} 
                    className="p-4 rounded-xl backdrop-blur-sm bg-gradient-to-r from-white/80 to-white/60 dark:from-white/5 dark:to-white/10 border border-white/20 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">Order #{order.orderNumber}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(order.total.toString())}
                        </p>
                        <GlassBadge variant={order.status.toLowerCase() === 'delivered' ? 'success' : 
                                        order.status.toLowerCase() === 'shipped' ? 'info' : 
                                        order.status.toLowerCase() === 'processing' ? 'warning' : 
                                        order.status.toLowerCase() === 'cancelled' ? 'danger' : 'default'}>
                          {order.status}
                        </GlassBadge>
                      </div>
                    </div>
                    
                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <p className="line-clamp-1">
                          {order.orderItems.map(item => item.product?.name).filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Wishlist Preview */}
          {wishlist.length > 0 && (
            <GlassCard className="bg-white dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Wishlist
                </h2>
                <GlassButton
                  onClick={() => handleNavigate('/dashboard/wishlist')}
                >
                  View all
                </GlassButton>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {wishlist.slice(0, 3).map(item => (
                  <div 
                    key={item.id} 
                    className="relative overflow-hidden rounded-xl aspect-[4/5] cursor-pointer group"
                    onClick={() => router.push(`/products/${item.product.slug}`)}
                  >
                    {/* Background overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-10" />
                    
                    {/* Product image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${item.product.images[0] || '/placeholder.jpg'})` 
                      }}
                    />
                    
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                      <p className="text-white font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-white/90 text-xs mt-1">
                        {formatCurrency(item.product.price.toString())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Address Preview */}
          {addresses.length > 0 && (
            <GlassCard className="bg-white dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <MapPin className="h-5 w-5 text-primary" />
                  Saved Addresses
                </h2>
                <GlassButton
                  onClick={() => handleNavigate('/dashboard/addresses')}
                >
                  Manage
                </GlassButton>
              </div>

              <div className="space-y-3">
                {addresses.slice(0, 2).map(addr => (
                  <div 
                    key={addr.id} 
                    className="p-3 rounded-xl backdrop-blur-sm bg-gradient-to-r from-white/80 to-white/60 dark:from-white/5 dark:to-white/10 border border-white/20"
                  >
                    <p className="font-medium text-slate-800 dark:text-white">{addr.line1}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {addr.city}, {addr.state} {addr.pincode}
                    </p>
                    {addr.country && (
                      <p className="text-xs text-slate-500">{addr.country}</p>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
} 