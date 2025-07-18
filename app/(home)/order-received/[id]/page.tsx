'use client'
import { useEffect, useState, use } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Next.js 14+ params typing
export type tParams = Promise<{ id: string }>

type Order = {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  orderItems?: Array<{
    id: string
    product?: { name: string }
    name?: string
    price: string | number
    quantity: number
  }>
  // Add other fields as needed
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <Card className="w-full max-w-3xl mx-auto p-0 flex flex-col md:flex-row gap-0 shadow-xl border-0">
        {/* Left: Confirmation Details */}
        <div className="flex-1 p-8 bg-white rounded-l-xl flex flex-col justify-center">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <span className="text-xs mt-1 font-medium text-orange-600">
                  Billing Address
                </span>
              </div>
              <div className="w-8 h-0.5 bg-orange-500" />
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-xs mt-1 font-medium text-orange-600">
                  Review & Payment
                </span>
              </div>
              <div className="w-8 h-0.5 bg-orange-500" />
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-xs mt-1 font-medium text-orange-600">
                  Confirmation
                </span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-12">
              Loading order details...
            </div>
          ) : error ? (
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4 text-red-600">
                Order Not Found
              </h2>
              <p className="mb-6">
                We couldn&apos;t find your order. Please check your order ID or
                contact support.
              </p>
              <Link href="/dashboard" className="inline-block">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-md shadow-md">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                Thank you for your order!
              </h2>
              <div className="bg-gray-50 rounded p-4 mb-6 text-left inline-block w-full max-w-xs mx-auto">
                <div>
                  <b>Order #:</b> {order?.orderNumber || order?.id}
                </div>
                <div>
                  <b>Date:</b>{' '}
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : ''}
                </div>
                <div>
                  <b>Status:</b> {order?.status}
                </div>
              </div>
              <Link href="/dashboard" className="w-full inline-block mt-2">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-md shadow-md">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
        {/* Right: Order Summary */}
        {!loading && !error && order && (
          <div className="w-full md:w-80 bg-gray-50 rounded-r-xl p-8 border-l flex flex-col justify-between">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4 flex-1">
              <ul className="divide-y">
                {order.orderItems?.map(item => (
                  <li
                    key={item.id}
                    className="py-2 flex justify-between items-center"
                  >
                    <span>
                      {item.product?.name || item.name} x {item.quantity}
                    </span>
                    <span>
                      ₹
                      {(
                        parseFloat(item.price.toString()) * item.quantity
                      ).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>
                  ₹
                  {order.total
                    ? parseFloat(order.total.toString()).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold mt-4">
                <span>Total</span>
                <span>
                  ₹
                  {order.total
                    ? parseFloat(order.total.toString()).toFixed(2)
                    : '0.00'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
