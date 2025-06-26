"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CheckoutPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    country: "India"
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    // Save to sessionStorage and redirect
    sessionStorage.setItem("checkout_shipping", JSON.stringify(form))
    router.push("/order-review")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Shipping Information</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
        <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" required />
        <Input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
        <Input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
        <Input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" required />
        <Input name="state" value={form.state} onChange={handleChange} placeholder="State" />
        <Input name="country" value={form.country} onChange={handleChange} placeholder="Country" />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full">Continue to Review</Button>
      </form>
    </div>
  )
} 