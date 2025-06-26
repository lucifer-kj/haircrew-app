import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PackageSearch, MapPin, Heart } from 'lucide-react'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const [orders, addresses, wishlistCount, user] = await Promise.all([
    prisma.order.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.address.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.wishlist.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.user.findUnique({
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
    }),
  ])

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="space-y-8">
        {/* Welcome Header */}
                    <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a summary of your account
          </p>
                    </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <PackageSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Addresses
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{addresses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wishlist Items
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wishlistCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recent Orders</h3>
          {user?.orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <PackageSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {user?.orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{parseFloat(order.total.toString()).toFixed(2)}</p>
                        <p className="text-sm capitalize text-muted-foreground">
                          {order.status.toLowerCase()}
                        </p>
                    </div>
                    </div>
                  </CardContent>
          </Card>
                ))}
              </div>
            )}
        </div>

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
    </div>
  )
} 