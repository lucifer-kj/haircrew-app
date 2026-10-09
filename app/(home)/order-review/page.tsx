'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import QRCode from 'qrcode'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/lib/uploadthing'
import { CheckCircle2, QrCode, Smartphone, ShieldCheck, AlertCircle, UploadCloud } from 'lucide-react'

const STORE_UPI_ID = process.env.NEXT_PUBLIC_STORE_UPI_ID || '9718707211@ybl'
const STORE_UPI_NAME = process.env.NEXT_PUBLIC_STORE_UPI_NAME || 'HairCrew'

interface ShippingInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
}

export default function OrderReviewPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotal, clearCart } = useCartStore()

  const [shipping, setShipping] = useState<ShippingInfo | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI')
  const [upiQR, setUpiQR] = useState<string>('')
  const [upiString, setUpiString] = useState<string>('')
  const [utrNumber, setUtrNumber] = useState<string>('')
  const [receiptUrl, setReceiptUrl] = useState<string>('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState<string>('')

  const subtotal = getTotal()
  const shippingFee = subtotal >= 1000 ? 0 : 50
  const total = subtotal + shippingFee

  // Load shipping details from session storage
  useEffect(() => {
    const data = sessionStorage.getItem('checkout_shipping')
    if (data) {
      setShipping(JSON.parse(data))
    } else {
      router.replace('/checkout')
    }
  }, [router])

  // Redirect if cart is empty
  useEffect(() => {
    if (!items || items.length === 0) {
      router.replace('/products')
    }
  }, [items, router])

  // Generate UPI Intent and QR code with exact order amount
  useEffect(() => {
    if (total > 0) {
      const upi = `upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(STORE_UPI_NAME)}&am=${total.toFixed(2)}&cu=INR&tn=HairCrewOrder`
      setUpiString(upi)
      QRCode.toDataURL(upi, { width: 256, margin: 2 }).then(setUpiQR)
    }
  }, [total])

  const handlePlaceOrder = async () => {
    if (!shipping) return
    setError('')

    // Validate UPI requirements
    if (paymentMethod === 'UPI') {
      const cleanUtr = utrNumber.trim()
      if (!cleanUtr) {
        setError('Please enter the 12-digit UPI Reference Number (UTR) from your payment app.')
        return
      }
      if (cleanUtr.length < 8) {
        setError('Please enter a valid UPI Transaction / Reference Number (usually 12 digits).')
        return
      }
    }

    setIsPlacing(true)

    try {
      const orderData = {
        method: paymentMethod,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        shipping: {
          name: shipping.name,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
          country: shipping.country || 'India',
        },
        guestEmail: !session?.user ? shipping.email : undefined,
        guestName: !session?.user ? shipping.name : undefined,
        guestPhone: !session?.user ? shipping.phone : undefined,
        paymentReference: paymentMethod === 'UPI' ? utrNumber.trim() : undefined,
        paymentReceiptUrl: paymentMethod === 'UPI' && receiptUrl ? receiptUrl : undefined,
      }

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        credentials: 'include',
      })

      const data = await res.json()
      setIsPlacing(false)

      if (res.ok) {
        toast.success('Order placed successfully!')
        clearCart()
        sessionStorage.removeItem('checkout_shipping')
        router.push(`/order-received/${data.id}`)
      } else {
        setError(data.error || 'Failed to place order. Please try again.')
        toast.error(data.error || 'Order placement failed')
      }
    } catch {
      setIsPlacing(false)
      setError('Network error. Please verify your connection and try again.')
    }
  }

  if (!shipping || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading order summary...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 text-center">
          Review & Complete Your Order
        </h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          Verify your details and choose your preferred payment option below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Payment & Verification (2 spans) */}
          <div className="md:col-span-2 space-y-6">
            {/* Step 1: Payment Method Selection */}
            <Card className="p-6 bg-white shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs flex items-center justify-center">1</span>
                Choose Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* UPI Option */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Smartphone className="w-5 h-5 text-purple-700" />
                      UPI (Zero Extra Fee)
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Pay using Google Pay, PhonePe, Paytm, or any UPI app.
                  </p>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">Cash on Delivery</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                      COD
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Pay in cash when your order arrives at your doorstep.
                  </p>
                </div>
              </div>
            </Card>

            {/* Step 2: UPI Payment Gateway Workflow */}
            {paymentMethod === 'UPI' && (
              <Card className="p-6 bg-white shadow-sm border border-purple-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs flex items-center justify-center">2</span>
                  Scan & Pay via UPI
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Pay exactly <strong className="text-gray-900">₹{total.toFixed(2)}</strong> to <strong>{STORE_UPI_ID}</strong> ({STORE_UPI_NAME})
                </p>

                {/* Mobile Intent Button */}
                <div className="block sm:hidden mb-5">
                  <a
                    href={upiString}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm hover:opacity-95"
                  >
                    <Smartphone className="w-4 h-4" />
                    Open in UPI App (GPay / PhonePe / Paytm)
                  </a>
                  <p className="text-center text-[11px] text-gray-400 mt-1">
                    Or scan QR code below using another device
                  </p>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                  {upiQR ? (
                    <div className="p-2 bg-white rounded-lg shadow-sm border shrink-0">
                      <Image
                        src={upiQR}
                        alt="HairCrew UPI QR Code"
                        width={180}
                        height={180}
                        className="rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-gray-200 animate-pulse rounded" />
                  )}

                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-purple-700" /> How to complete payment:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                      <li>Open any UPI app (GPay, PhonePe, Paytm, BHIM).</li>
                      <li>Scan this QR code or tap the button above on mobile.</li>
                      <li>Verify recipient: <strong>{STORE_UPI_NAME}</strong> ({STORE_UPI_ID}).</li>
                      <li>Complete payment of <strong>₹{total.toFixed(2)}</strong>.</li>
                      <li>Copy the <strong>12-digit UTR / Ref Number</strong> from your payment receipt.</li>
                    </ol>
                  </div>
                </div>

                {/* Step 3: Dual Verification Details */}
                <div className="space-y-4 pt-2 border-t">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Enter UPI Reference / UTR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      placeholder="e.g. 429381749201 (12 digits)"
                      maxLength={24}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Found in your UPI app under &quot;Payment Details&quot; or &quot;UPI Ref ID / UTR&quot;.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Payment Screenshot Proof (Optional for Faster Verification)
                    </label>
                    {receiptUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="truncate flex-1">Screenshot attached successfully</span>
                        <button
                          type="button"
                          onClick={() => setReceiptUrl('')}
                          className="text-xs text-red-600 underline font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 border border-dashed rounded-lg bg-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-gray-400" />
                          Attach receipt image (.jpg, .png)
                        </span>
                        <UploadButton<OurFileRouter, 'imageUploader'>
                          endpoint="imageUploader"
                          onClientUploadComplete={res => {
                            if (res?.[0]?.url) {
                              setReceiptUrl(res[0].url)
                              toast.success('Screenshot uploaded!')
                            }
                          }}
                          onUploadError={(err: Error) => {
                            toast.error(`Upload error: ${err.message}`)
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Final Place Order Button */}
            <Button
              type="button"
              disabled={isPlacing}
              onClick={handlePlaceOrder}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 text-base rounded-xl shadow-lg transition-all"
            >
              {isPlacing ? (
                'Placing Your Order...'
              ) : paymentMethod === 'UPI' ? (
                `Confirm & Submit Payment Verification (₹${total.toFixed(2)})`
              ) : (
                `Place Cash on Delivery Order (₹${total.toFixed(2)})`
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              100% Genuine HairCare Products • Direct Salon Formulations
            </div>
          </div>

          {/* Right Column: Order & Shipping Summary */}
          <div className="space-y-6">
            {/* Shipping Summary */}
            <Card className="p-5 bg-white shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b">
                Delivery Address
              </h3>
              <p className="font-semibold text-gray-800 text-sm">{shipping.name}</p>
              <p className="text-xs text-gray-600 mt-1">{shipping.address}</p>
              <p className="text-xs text-gray-600">
                {shipping.city}, {shipping.state} - {shipping.pincode}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Phone:</strong> {shipping.phone}
              </p>
              <p className="text-xs text-gray-600">
                <strong>Email:</strong> {shipping.email}
              </p>
            </Card>

            {/* Cart Items Summary */}
            <Card className="p-5 bg-white shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b">
                Order Items ({items.length})
              </h3>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-gray-700 font-medium truncate mr-2">
                      {item.name} <span className="text-gray-400">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-900 shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mt-4 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-green-600">Free</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t">
                  <span>Total Amount</span>
                  <span className="text-purple-700 font-extrabold text-base">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
