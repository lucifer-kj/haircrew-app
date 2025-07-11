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
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-gray-600">Manage your account and view your activity</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon
          return (
            <Card 
              key={card.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
              onClick={() => handleCardClick(card.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  {card.stats !== null && (
                    <Badge variant="secondary" className="text-sm">
                      {card.stats}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <PackageSearch className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">{wishlist.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Addresses</p>
                <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Preview */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{parseFloat(order.total.toString()).toFixed(2)}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
              {orders.length > 3 && (
                <Button 
                  className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
                  onClick={() => router.push('/dashboard/orders')}
                >
                  View All Orders
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 