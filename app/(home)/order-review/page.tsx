"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import QRCode from "qrcode"
import Image from "next/image"
import { useSession, signIn } from "next-auth/react"

const UPI_ID = "owner@upi"
const UPI_NAME = "Owner"

interface ShippingInfo {
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
}

export default function OrderReviewPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, getTotal, clearCart } = useCartStore()
  const [shipping, setShipping] = useState<ShippingInfo | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD")
  const [upiQR, setUpiQR] = useState<string>("")
  const [upiString, setUpiString] = useState<string>("")
  const [isPlacing, setIsPlacing] = useState(false)
  const [step, setStep] = useState<"review" | "upi" | "confirmation">("review")
  const [orderId, setOrderId] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const data = sessionStorage.getItem("checkout_shipping")
    if (data) setShipping(JSON.parse(data))
    else router.replace("/checkout")
  }, [router])

  useEffect(() => {
    if (paymentMethod === "UPI") {
      const upi = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${getTotal()}&cu=INR`
      setUpiString(upi)
      QRCode.toDataURL(upi).then(setUpiQR)
    }
  }, [paymentMethod, getTotal])

  if (!shipping) return null
  if (items.length === 0) {
    router.replace("/products")
    return null
  }

  // Session loading state
  if (status === "loading") {
    return <div className="text-center py-12">Checking authentication...</div>
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Sign in required</h2>
        <p className="mb-6">You must be signed in to place an order.</p>
        <Button onClick={() => signIn()}>Sign In</Button>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    setIsPlacing(true)
    setError("")
    const orderData = {
      method: paymentMethod,
      status: paymentMethod === "COD" ? "pending" : "payment_pending_confirmation",
      items,
      amount: getTotal(),
      shipping,
      createdAt: new Date().toISOString(),
    }
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
      credentials: "include",
    })
    const data = await res.json()
    setIsPlacing(false)
    if (res.ok) {
      setOrderId(data.id)
      clearCart()
      setStep(paymentMethod === "COD" ? "confirmation" : "upi")
    } else if (res.status === 401) {
      setError("You must be signed in to place an order. Please sign in and try again.")
    } else {
      setError(data.error || "Failed to place order")
    }
  }

  const handlePaid = async () => {
    setIsPlacing(true)
    setError("")
    // Update order status to payment_pending_confirmation
    const res = await fetch(`/api/order/${orderId}/confirm-upi`, { method: "POST", credentials: "include" })
    setIsPlacing(false)
    if (res.ok) {
      setStep("confirmation")
    } else if (res.status === 401) {
      setError("You must be signed in to confirm payment. Please sign in and try again.")
    } else {
      setError("Failed to update order status")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Order Review</h1>
      {/* Shipping Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-2">Shipping Information</h2>
        <div className="text-sm text-gray-700">
          <div><b>Name:</b> {shipping.name}</div>
          <div><b>Phone:</b> {shipping.phone}</div>
          <div><b>Address:</b> {shipping.address}, {shipping.city}, {shipping.state}, {shipping.pincode}, {shipping.country}</div>
        </div>
      </div>
      {/* Cart Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-2">Order Items</h2>
        <ul className="divide-y">
          {items.map(item => (
            <li key={item.id} className="py-2 flex justify-between items-center">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold mt-4">
          <span>Total</span>
          <span>₹{getTotal().toFixed(2)}</span>
        </div>
      </div>
      {/* Error message */}
      {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
      {/* Payment Method */}
      {step === "review" && (
        <form onSubmit={e => { e.preventDefault(); handlePlaceOrder() }} className="space-y-6">
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Payment Method</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")}/>
                Cash on Delivery
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" value="UPI" checked={paymentMethod === "UPI"} onChange={() => setPaymentMethod("UPI")}/>
                UPI Payment
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPlacing}>{isPlacing ? "Placing Order..." : "Place Order"}</Button>
        </form>
      )}
      {/* UPI Payment Step */}
      {step === "upi" && (
        <div className="text-center space-y-6">
          <h2 className="text-xl font-bold">Scan to Pay with UPI</h2>
          {upiQR && <Image src={upiQR} alt="UPI QR Code" width={192} height={192} className="mx-auto w-48 h-48" />}
          <a href={upiString} className="text-[var(--primary)] underline block">Open UPI App</a>
          <Button onClick={handlePaid} className="w-full" disabled={isPlacing}>{isPlacing ? "Processing..." : "I've Paid"}</Button>
          <div className="text-gray-500 text-sm">After payment, click &quot;I&apos;ve Paid&quot; to notify the seller.</div>
        </div>
      )}
      {/* Confirmation Step */}
      {step === "confirmation" && (
        <div className="text-center space-y-6">
          <h2 className="text-xl font-bold">Order Placed!</h2>
          <div className="text-lg">{paymentMethod === "COD" ? "Pay on delivery." : "Waiting for seller to confirm payment."}</div>
          <Button onClick={() => router.push("/")} className="w-full">Back to Home</Button>
        </div>
      )}
    </div>
  )
} 