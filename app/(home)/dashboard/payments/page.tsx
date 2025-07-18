import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Wallet } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      paymentStatus: true,
      paymentMethod: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Your payment history and methods</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No payment history found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          {order.paymentMethod && (
                            <p className="text-xs text-muted-foreground">
                              {order.paymentMethod}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ₹{parseFloat(order.total.toString()).toFixed(2)}
                          </p>
                          <Badge
                            className={getPaymentStatusColor(
                              order.paymentStatus
                            )}
                          >
                            {order.paymentStatus.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">UPI QR Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Scan QR code to pay instantly
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Cash on Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Pay when you receive your order
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Payment Security</h4>
              <p className="text-sm text-muted-foreground">
                All payments are processed securely. We use industry-standard
                encryption to protect your payment information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
