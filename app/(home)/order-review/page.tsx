'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import QRCode from 'qrcode'
import Image from 'next/image'
import { useSession, signIn } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { AccessibleErrorMessage } from '@/components/ui/accessibility'
import { z } from 'zod'

const UPI_ID = '9718707211@ybl'
const UPI_NAME = 'Shah Faisal'

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
  const { items, getTotal } = useCartStore()
  const [cartError, setCartError] = useState('')
  const [shipping, setShipping] = useState<ShippingInfo | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD')
  const [upiQR, setUpiQR] = useState<string>('')
  const [upiString, setUpiString] = useState<string>('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [step, setStep] = useState<'review' | 'upi' | 'confirmation'>('review')
  const [, setShowModal] = useState(false)
  const [, setShowModalOrderId] = useState<string>('')
  const modalTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [error, setError] = useState<string>('')
  const CheckoutSchema = z.object({
    name: z.string().min(2, 'Name is required.'),
    phone: z.string().min(10, 'Phone is required.'),
    address: z.string().min(5, 'Address is required.'),
    city: z.string().min(2, 'City is required.'),
    state: z.string().min(2, 'State is required.'),
    pincode: z.string().min(4, 'Pincode is required.'),
    country: z.string().min(2, 'Country is required.'),
    paymentMethod: z.enum(['COD', 'UPI'], { required_error: 'Payment method is required.' }),
  })
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const data = sessionStorage.getItem('checkout_shipping')
    if (data) setShipping(JSON.parse(data))
    else router.replace('/checkout')
  }, [router])

  useEffect(() => {
    // Cart validation
    if (!items || items.length === 0) {
      setCartError('Your cart is empty. Please add items before proceeding.')
      setTimeout(() => router.replace('/products'), 2000)
      return
    }
    if (items.some(item => item.quantity <= 0)) {
      setCartError('Cart contains invalid item quantities.')
      setTimeout(() => router.replace('/products'), 2000)
      return
    }
  }, [items, router])

  // UPI QR Code - Bookmark this part
  useEffect(() => {
    if (paymentMethod === 'UPI') {
      const upi = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${getTotal()}&cu=INR`
      setUpiString(upi)
      QRCode.toDataURL(upi).then(setUpiQR)
    }
  }, [paymentMethod, getTotal])

  // COD: Place order immediately
  const handlePlaceOrder = async () => {
    setIsPlacing(true)
    setError('')
    setFieldErrors({})
    const shippingData = shipping || {}
    const result = CheckoutSchema.safeParse({ ...shippingData, paymentMethod })
    if (!result.success) {
      const errors: { [key: string]: string } = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0]] = err.message
      })
      setFieldErrors(errors)
      setIsPlacing(false)
      return
    }
    const orderData = {
      method: paymentMethod,
      status: 'pending',
      items,
      amount: getTotal(),
      shipping,
      createdAt: new Date().toISOString(),
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
      setShowModalOrderId(data.id)
      setShowModal(true)
      if (modalTimeout.current) clearTimeout(modalTimeout.current)
      modalTimeout.current = setTimeout(() => {
        setShowModal(false)
        router.push(`/order-received/${data.id}`)
      }, 2500)
    } else if (res.status === 401) {
      setError('You must be signed in to place an order. Please sign in and try again.')
      toast.error('Authentication required. Please sign in to continue.')
    } else {
      setError(data.error || 'An error occurred while placing your order. Please try again or contact support.')
      toast.error(data.error || 'Order placement failed. Please try again.')
    }
  }

  // UPI: Only create order after payment confirmation
  const handleProceedToPayment = () => {
    setStep('upi')
  }

  const handlePaid = async () => {
    setIsPlacing(true)
    setError('')
    // Create order with payment_pending_confirmation
    const orderData = {
      method: paymentMethod,
      status: 'payment_pending_confirmation',
      items,
      amount: getTotal(),
      shipping,
      createdAt: new Date().toISOString(),
    }
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      credentials: 'include',
    })
    const data = await res.json()
    if (res.ok) {
      // Immediately mark as PAID to trigger admin notification
      await fetch('/api/order/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.id, newStatus: 'PAID' }),
        credentials: 'include',
      })
    }
    setIsPlacing(false)
    if (res.ok) {
      toast.success('Payment confirmed! Order placed successfully!')
      setShowModalOrderId(data.id)
      setShowModal(true)
      if (modalTimeout.current) clearTimeout(modalTimeout.current)
      modalTimeout.current = setTimeout(() => {
        setShowModal(false)
        router.push(`/order-received/${data.id}`)
      }, 2500)
    } else if (res.status === 401) {
      setError(
        'You must be signed in to place an order. Please sign in and try again.'
      )
      toast.error('Authentication required')
    } else {
      setError(data.error || 'Failed to place order')
      toast.error(data.error || 'Failed to place order')
    }
  }

  // Conditional rendering logic
  let content = null
  if (cartError) {
    content = (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Cart Error</h2>
        <p className="mb-6 text-red-500">{cartError}</p>
      </div>
    )
  } else if (!shipping || items.length === 0) {
    content = null
  } else if (status === 'loading') {
    content = <div className="text-center py-12">Checking authentication...</div>
  } else if (!session) {
    content = (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Sign in required</h2>
        <p className="mb-6">You must be signed in to place an order.</p>
        <Button onClick={() => signIn()}>Sign In</Button>
      </div>
    )
  } else {
    content = (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
        <Card className="w-full max-w-4xl mx-auto p-0 flex flex-col md:flex-row gap-0 shadow-xl border-0">
          {/* Left: Shipping & Payment */}
          <div className="flex-1 p-8 bg-white rounded-l-xl">
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
                <div className="w-8 h-0.5 bg-gray-300" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-xs mt-1 font-medium text-gray-400">
                    Confirmation
                  </span>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-6 text-center">Order Review</h1>
            {/* Shipping Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold mb-2">Shipping Information</h2>
              <div className="text-sm text-gray-700">
                <div>
                  <b>Name:</b> {shipping?.name}
                  {fieldErrors.name && <AccessibleErrorMessage error={fieldErrors.name} id="checkout-name-error" />}
                </div>
                <div>
                  <b>Phone:</b> {shipping?.phone}
                  {fieldErrors.phone && <AccessibleErrorMessage error={fieldErrors.phone} id="checkout-phone-error" />}
                </div>
                <div>
                  <b>Address:</b> {shipping?.address}, {shipping?.city}, {shipping?.state}, {shipping?.pincode}, {shipping?.country}
                  {fieldErrors.address && <AccessibleErrorMessage error={fieldErrors.address} id="checkout-address-error" />}
                  {fieldErrors.city && <AccessibleErrorMessage error={fieldErrors.city} id="checkout-city-error" />}
                  {fieldErrors.state && <AccessibleErrorMessage error={fieldErrors.state} id="checkout-state-error" />}
                  {fieldErrors.pincode && <AccessibleErrorMessage error={fieldErrors.pincode} id="checkout-pincode-error" />}
                  {fieldErrors.country && <AccessibleErrorMessage error={fieldErrors.country} id="checkout-country-error" />}
                </div>
              </div>
            </div>
            {/* Payment Method */}
            {step === 'review' && (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (paymentMethod === 'COD') handlePlaceOrder()
                  else handleProceedToPayment()
                }}
                className="space-y-6"
                aria-live="polite"
              >
                <div className="mb-4">
                  <h2 className="font-semibold mb-2">Payment Method</h2>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2" htmlFor="COD"> 
                      <input
                        type="radio"  
                        name="payment"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        aria-describedby={fieldErrors.paymentMethod ? 'checkout-payment-error' : undefined}
                      />
                      Cash on Delivery
                    </label>
                    <label className="flex items-center gap-2" htmlFor="UPI"> 
                      <input
                        type="radio"
                        name="payment"
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        aria-describedby={fieldErrors.paymentMethod ? 'checkout-payment-error' : undefined}
                      />
                      UPI Payment
                    </label>
                  </div>
                  {fieldErrors.paymentMethod && <AccessibleErrorMessage error={fieldErrors.paymentMethod} id="checkout-payment-error" />}
                </div>
                {error && (
                  <AccessibleErrorMessage error={error} id="order-review-error" />
                )}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold py-3 rounded-md shadow-md"
                >
                  {isPlacing
                    ? 'Processing...'
                    : paymentMethod === 'COD'
                      ? 'Place Order'
                      : 'Proceed to Payment'}
                </Button>
              </form>
            )}
            {/* UPI Payment Step */}
            {step === 'upi' && (
              <div className="text-center space-y-6" aria-live="polite">
                <h2 className="text-xl font-bold">Scan to Pay with UPI</h2>
                {upiQR && (
                  <Image
                    src={upiQR}
                    alt="UPI QR Code"
                    width={192}
                    height={192}
                    className="mx-auto w-48 h-48"
                  />
                )}
                <a
                  href={upiString}
                  className="text-[var(--primary)] underline block"
                >
                  Open UPI App
                </a>
                <Button
                  onClick={handlePaid}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold py-3 rounded-md shadow-md"
                >
                  {isPlacing ? 'Processing...' : "I've Paid"}
                </Button>
                <div className="text-gray-500 text-sm">
                  After payment, click &quot;I&apos;ve Paid&quot; to notify the
                  seller.
                </div>
              </div>
            )}
          </div>
          {/* Right: Order Summary */}
          <div className="w-full md:w-96 bg-gray-50 rounded-r-xl p-8 border-l flex flex-col justify-between">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4 flex-1">
              <ul className="divide-y">
                {items.map(
                  (item: {
                    id: string
                    name: string
                    price: number
                    quantity: number
                  }) => (
                    <li
                      key={item.id}
                      className="py-2 flex justify-between items-center"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  )
                )}
              </ul>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>₹{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold mt-4">
                <span>Total</span>
                <span>₹{getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return content
}
