'use client'
import { useEffect, useState, use } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Clock, PackageCheck, AlertCircle, ShoppingBag } from 'lucide-react'

export type tParams = Promise<{ id: string }>

type Order = {
  id: string
  orderNumber: string
  total: number
  subtotal?: number
  shipping?: number
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentReference?: string
  createdAt: string
  orderItems?: Array<{
    id: string
    product?: { name: string; images?: string[] }
    name?: string
    price: string | number
    quantity: number
  }>
  guestEmail?: string
}

export default function OrderReceivedPage({ params }: { params: tParams }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/order?id=${id}`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Order not found')
        }
        return res.json()
      })
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-4xl mx-auto p-0 flex flex-col md:flex-row gap-0 shadow-xl border border-gray-200 overflow-hidden rounded-2xl bg-white">
        {/* Left: Confirmation & Verification Status */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
          {loading ? (
            <div className="text-center text-gray-500 py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading order details...
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Order Not Found</h2>
              <p className="text-gray-600 text-sm mb-6">
                We couldn&apos;t load the order details. If you just placed an order, please check your email confirmation.
              </p>
              <Link href="/products">
                <Button className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : order ? (
            <div>
              <div className="text-center md:text-left mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Order Placed Successfully
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  Thank you for your order!
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  We have received your order and are preparing it for fulfillment.
                </p>
              </div>

              {/* Status Banner for Zero-Gateway UPI Workflow */}
              {order.paymentMethod === 'UPI' && order.paymentStatus === 'AWAITING_VERIFICATION' ? (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">
                        Payment Under Verification
                      </h4>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Your UPI Reference <strong>({order.paymentReference || 'UTR'})</strong> is being verified by our team. Once confirmed, your order status will automatically update to <strong>Processing</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : order.paymentStatus === 'PAID' ? (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-900 text-sm">Payment Verified</h4>
                      <p className="text-xs text-green-700">Your payment has been verified and your package is being prepared.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                  <strong>Cash on Delivery (COD):</strong> Please keep cash ready at delivery time.
                </div>
              )}

              {/* Order Meta Box */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Number:</span>
                  <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-800 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-medium text-gray-800">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status:</span>
                  <span className="font-semibold text-purple-700">
                    {order.paymentStatus === 'AWAITING_VERIFICATION' ? 'Awaiting Verification' : order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/products" className="flex-1">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-gray-300">
                    <ShoppingBag className="w-4 h-4" /> Continue Shopping
                  </Button>
                </Link>
                <Link href="/dashboard/user/orders" className="flex-1">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold">
                    View in Account
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right: Order Summary */}
        {!loading && !error && order && (
          <div className="w-full md:w-80 bg-gray-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
                Order Summary
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {order.orderItems?.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-gray-700 font-medium truncate mr-2">
                      {item.product?.name || item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900 shrink-0">
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4 mt-4 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal || order.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{Number(order.shipping || 0) === 0 ? <strong className="text-green-600">Free</strong> : `₹${order.shipping}`}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-6 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900">Total Paid/Due</span>
              <span className="text-2xl font-extrabold text-purple-900">
                ₹{Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
