"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Heart, PackageSearch, Star, CreditCard } from 'lucide-react'
import { Decimal } from '@prisma/client/runtime/library'
import { useRouter } from 'next/navigation'

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
  city: string
  pincode: string
  state: string
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

interface UserData {
  id: string
  name: string | null
  email: string
}

interface DashboardClientProps {
  user: UserData | null
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const dashboardCards = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your account information',
      icon: User,
      color: 'bg-blue-500',
      href: '/dashboard/profile',
      stats: null
    },
    {
      id: 'orders',
      title: 'Orders',
      description: 'View your order history',
      icon: PackageSearch,
      color: 'bg-green-500',
      href: '/dashboard/orders',
      stats: orders.length
    },
    {
      id: 'addresses',
      title: 'Addresses',
      description: 'Manage your shipping addresses',
      icon: MapPin,
      color: 'bg-purple-500',
      href: '/dashboard/addresses',
      stats: addresses.length
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      description: 'Your saved items',
      icon: Heart,
      color: 'bg-pink-500',
      href: '/dashboard/wishlist',
      stats: wishlist.length
    },
    {
      id: 'reviews',
      title: 'Reviews',
      description: 'Your product reviews',
      icon: Star,
      color: 'bg-yellow-500',
      href: '/dashboard/reviews',
      stats: null
    },
    {
      id: 'payments',
      title: 'Payments',
      description: 'Payment methods & history',
      icon: CreditCard,
      color: 'bg-indigo-500',
      href: '/dashboard/payments',
      stats: null
    }
  ]

  const handleCardClick = (href: string) => {
    router.push(href)
  }

  return (
    <div className="w-full space-y-6">
      {/* Welcome Section - Simplified for mobile */}
      <div className="text-center space-y-2 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hello, {user?.name || 'User'}</h1>
        <p className="text-sm text-gray-600">Manage your account and orders</p>
      </div>

      {/* Dashboard Cards - More mobile-friendly layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon
          return (
            <Card 
              key={card.id}
              className="group cursor-pointer transition-all border hover:border-primary/20 h-full"
              onClick={() => handleCardClick(card.href)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className={`p-2 md:p-3 rounded-full ${card.color}`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors">
                  {card.title}
                </CardTitle>
                {card.stats !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {card.stats}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Simplified Quick Stats for mobile */}
      <div className="grid grid-cols-3 gap-3 px-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xs md:text-sm font-medium text-gray-600">Orders</p>
            <p className="text-lg md:text-xl font-bold text-gray-900">{orders.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xs md:text-sm font-medium text-gray-600">Wishlist</p>
            <p className="text-lg md:text-xl font-bold text-gray-900">{wishlist.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xs md:text-sm font-medium text-gray-600">Addresses</p>
            <p className="text-lg md:text-xl font-bold text-gray-900">{addresses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Preview - Simplified for mobile */}
      {orders.length > 0 && (
        <div className="px-4">
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <PackageSearch className="h-4 w-4" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {orders.slice(0, 3).map(order => (
                  <div key={order.id} className="p-3 border rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">#{order.orderNumber}</span>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>₹{parseFloat(order.total.toString()).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {orders.length > 3 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-sm" 
                  onClick={() => router.push('/dashboard/orders')}
                >
                  View All Orders
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 