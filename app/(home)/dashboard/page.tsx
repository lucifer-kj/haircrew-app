"use client"

import { useSession, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (session?.user) {
      fetch("/api/order/history", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data)
          else setError(data.error || "Failed to load orders.")
        })
        .catch(() => setError("Failed to load orders."))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [session])

  if (status === "loading") return <div className="py-12 text-center">Loading...</div>
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Sign in required</h2>
        <p className="mb-6">You must be signed in to view your dashboard.</p>
        <Button onClick={() => signIn()}>Sign In</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-2">Profile</h2>
        <div className="text-sm text-gray-700">
          <div><b>Name:</b> {session.user?.name}</div>
          <div><b>Email:</b> {session.user?.email}</div>
        </div>
      </div>
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-2">Order History</h2>
        {loading ? (
          <div>Loading orders...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div>No orders found.</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Order #</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="p-2">{order.orderNumber}</td>
                  <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">₹{order.total.toFixed(2)}</td>
                  <td className="p-2">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex gap-4">
        <Button variant="outline" asChild><a href="#">Saved Addresses</a></Button>
        <Button variant="outline" asChild><a href="#">Wishlist</a></Button>
      </div>
    </div>
  )
} 