'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCartStore } from '@/store/cart-store'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    country: 'India',
  })
  const [error, setError] = useState('')

  // Address auto-fill for logged-in users
  const [addresses, setAddresses] = useState<
    {
      id: string
      name: string
      phone: string
      address: string
      city: string
      pincode: string
      state: string
      country: string
    }[]
  >([])
  const [selectedAddress, setSelectedAddress] = useState('')

  const { getTotal, items } = useCartStore()
  const subtotal = getTotal()
  const shippingFee = subtotal >= 1000 ? 0 : 50
  const total = subtotal + shippingFee

  // Pre-fill user details if logged in
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }))

      fetch('/api/user/addresses', { credentials: 'include' })
        .then(res => (res.ok ? res.json() : []))
        .then(data => {
          setAddresses(Array.isArray(data) ? data : [])
        })
        .catch(() => {
          setAddresses([])
        })
    }
  }, [session])

  const handleSelectAddress = (id: string) => {
    setSelectedAddress(id)
    const addr = addresses.find(a => a.id === id)
    if (addr) {
      setForm(prev => ({
        ...prev,
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        pincode: addr.pincode,
        state: addr.state,
        country: addr.country,
      }))
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Cart validation
    if (!items || items.length === 0) {
      setError('Your cart is empty. Please add items before proceeding.')
      return
    }
    if (items.some(item => item.quantity <= 0)) {
      setError('Cart contains invalid item quantities.')
      return
    }

    // Required fields validation
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.pincode
    ) {
      setError('Please fill in all required fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address for order updates.')
      return
    }

    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(form.phone)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setError('')
    // Save to sessionStorage and proceed to order review
    sessionStorage.setItem('checkout_shipping', JSON.stringify(form))
    router.push('/order-review')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <Card className="w-full max-w-4xl mx-auto p-0 flex flex-col md:flex-row gap-0 shadow-xl border-0 overflow-hidden rounded-xl">
        {/* Left: Shipping & Contact Form */}
        <div className="flex-1 p-6 md:p-8 bg-white">
          <div className="flex items-center justify-between mb-6 pb-3 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Shipping Details</h1>
            {!session?.user && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                Guest Checkout
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Select Dropdown for saved addresses */}
            {addresses.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <label className="block text-sm font-semibold text-purple-900 mb-1">
                  Choose Saved Address
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm bg-white"
                  value={selectedAddress}
                  onChange={e => handleSelectAddress(e.target.value)}
                >
                  <option value="">-- Or enter new address below --</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.name}, {addr.address}, {addr.city} ({addr.pincode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <Input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Flat / House No., Street, Area"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full min-h-[46px] bg-purple-700 hover:bg-purple-800 text-white text-base font-semibold py-3 rounded-lg shadow-md mt-6"
            >
              Continue to Payment & Review
            </Button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full md:w-80 p-6 md:p-8 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 shrink-0">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-green-600">Free</strong> : `₹${shippingFee}`}</span>
              </div>
              {subtotal < 1000 && (
                <p className="text-xs text-purple-600 mt-1">
                  Add ₹{(1000 - subtotal).toFixed(0)} more for Free Shipping!
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-purple-900">
                ₹{total.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Includes applicable taxes</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
