'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCartStore } from '@/store/cart-store'

export default function CheckoutPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    country: 'India',
  })
  const [error, setError] = useState('')
  // Address auto-fill
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

  const { getTotal } = useCartStore()
  const subtotal = getTotal()
  const total = subtotal // Add shipping/discount logic if needed

  useEffect(() => {
    fetch('/api/user/addresses', { credentials: 'include' })
      .then(res => res.json())
      .then(data =>
        Array.isArray(data) ? setAddresses(data) : setAddresses([])
      )
  }, [])

  const handleSelectAddress = (id: string) => {
    setSelectedAddress(id)
    const addr = addresses.find(a => a.id === id)
    if (addr) {
      setForm({
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        pincode: addr.pincode,
        state: addr.state,
        country: addr.country,
      })
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.pincode
    ) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    // Save to sessionStorage and redirect
    sessionStorage.setItem('checkout_shipping', JSON.stringify(form))
    router.push('/order-review')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <Card className="w-full max-w-4xl mx-auto p-0 flex flex-col md:flex-row gap-0 shadow-xl border-0">
        {/* Left: Form */}
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
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-xs mt-1 font-medium text-gray-400">
                  Shipping Method
                </span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-xs mt-1 font-medium text-gray-400">
                  Payment Method
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center">Checkout</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Select Dropdown */}
            {addresses.length > 0 && (
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">
                  Choose Saved Address
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-base"
                  value={selectedAddress}
                  onChange={e => handleSelectAddress(e.target.value)}
                >
                  <option value="">-- Select an address --</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.name}, {addr.address}, {addr.city}, {addr.state},{' '}
                      {addr.pincode}, {addr.country}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  aria-invalid={!!error && !form.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  aria-invalid={!!error && !form.phone}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                required
                aria-invalid={!!error && !form.address}
              />
              {!form.address && error && (
                <div className="text-red-500 text-xs mt-1">
                  This value is required
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  aria-invalid={!!error && !form.city}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pincode
                </label>
                <Input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  required
                  aria-invalid={!!error && !form.pincode}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-1">
                  Country
                </label>
                <Input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold py-3 rounded-md shadow-md mt-4"
            >
              Continue to Review
            </Button>
          </form>
        </div>
        {/* Right: Order Summary */}
        <div className="flex-1 p-8 bg-gray-50 rounded-r-xl">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4 flex-1">
            {/* You can map cart items here if needed */}
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold mt-4">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
