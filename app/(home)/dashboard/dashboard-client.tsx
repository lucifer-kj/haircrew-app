"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'
import { User, MapPin, Heart, PackageSearch, Edit, Trash2, Plus, X } from 'lucide-react'
import { Decimal } from '@prisma/client/runtime/library'

interface Order {
  id: string
  orderNumber: string
  total: Decimal
  status: string
  createdAt: string
  orderItems?: Array<{
    id: string
    product?: { name: string }
    name?: string
    price: string | number
    quantity: number
  }>
}

interface Address {
  id: string
  line1: string
  city: string
  pincode: string
  state: string
  country: string
}

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: Decimal
    images: string[]
    slug: string
  }
}

interface UserData {
  id: string
  name: string | null
  email: string
}

interface DashboardClientProps {
  user: UserData | null
  initialOrders: Order[]
  initialAddresses: Address[]
  initialWishlist: WishlistItem[]
}

export default function DashboardClient({ 
  user, 
  initialOrders, 
  initialAddresses, 
  initialWishlist 
}: DashboardClientProps) {
  const [orders] = useState<Order[]>(initialOrders)
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist)
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [addressForm, setAddressForm] = useState<Address | null>(null)
  const [addressMode, setAddressMode] = useState<"add" | "edit" | null>(null)
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressError, setAddressError] = useState("")
  const [addressSuccess, setAddressSuccess] = useState("")

  const emptyAddress: Address = {
    id: "",
    line1: "",
    city: "",
    pincode: "",
    state: "",
    country: ""
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError("")
    setProfileSuccess("")
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
        credentials: "include"
      })
      const data = await res.json()
      
      if (res.ok) {
        setProfileSuccess("Profile updated successfully.")
        setEditProfile(false)
        // Reset password fields
        setProfileForm(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
      } else {
        setProfileError(data.error || "Failed to update profile.")
      }
    } catch {
      setProfileError("Failed to update profile.")
    } finally {
      setProfileLoading(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!addressForm) return
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value })
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addressForm) return
    
    setAddressLoading(true)
    setAddressError("")
    setAddressSuccess("")
    
    try {
      const res = await fetch("/api/user/addresses", {
        method: addressMode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
        credentials: "include"
      })
      const data = await res.json()
      
      if (res.ok) {
        setAddressSuccess(addressMode === "edit" ? "Address updated." : "Address added.")
        setAddresses(prev => {
          if (addressMode === "edit") {
            return prev.map(a => a.id === data.id ? data : a)
          } else {
            return [...prev, data]
          }
        })
        setAddressForm(null)
        setAddressMode(null)
      } else {
        setAddressError(data.error || "Failed to save address.")
      }
    } catch {
      setAddressError("Failed to save address.")
    } finally {
      setAddressLoading(false)
    }
  }

  const handleEditAddress = (addr: Address) => {
    setAddressForm(addr)
    setAddressMode("edit")
    setAddressError("")
    setAddressSuccess("")
  }

  const handleDeleteAddress = async (id: string) => {
    setAddressLoading(true)
    setAddressError("")
    setAddressSuccess("")
    
    try {
      const res = await fetch("/api/user/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include"
      })
      
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== id))
        setAddressSuccess("Address deleted.")
      } else {
        const data = await res.json()
        setAddressError(data.error || "Failed to delete address.")
      }
    } catch {
      setAddressError("Failed to delete address.")
    } finally {
      setAddressLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        credentials: "include"
      })
      setWishlist(prev => prev.filter(w => w.product.id !== productId))
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <PackageSearch className="h-4 w-4" />
          Orders
        </TabsTrigger>
        <TabsTrigger value="addresses" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Addresses
        </TabsTrigger>
        <TabsTrigger value="wishlist" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Wishlist
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!editProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                </div>
                <Button onClick={() => setEditProfile(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input name="name" value={profileForm.name} onChange={handleProfileChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input name="email" value={profileForm.email} onChange={handleProfileChange} required type="email" />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Password</label>
                      <Input name="currentPassword" value={profileForm.currentPassword} onChange={handleProfileChange} type="password" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <Input name="newPassword" value={profileForm.newPassword} onChange={handleProfileChange} type="password" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <Input name="confirmPassword" value={profileForm.confirmPassword} onChange={handleProfileChange} type="password" />
                  </div>
                </div>
                {profileError && <div className="text-red-600 text-sm">{profileError}</div>}
                {profileSuccess && <div className="text-green-600 text-sm">{profileSuccess}</div>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditProfile(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="h-5 w-5" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <PackageSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{parseFloat(order.total.toString()).toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.toLowerCase()}
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
      </TabsContent>

      <TabsContent value="addresses" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Saved Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {addresses.map(addr => (
                <Card key={addr.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{addr.line1}</p>
                        <p className="text-sm text-muted-foreground">
                          {addr.city}, {addr.state} {addr.pincode}
                        </p>
                        <p className="text-sm text-muted-foreground">{addr.country}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => handleEditAddress(addr)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteAddress(addr.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add/Edit Address Form */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">
                      {addressMode === "edit" ? "Edit Address" : "Add New Address"}
                    </h4>
                    {addressForm && (
                      <Button size="sm" variant="ghost" onClick={() => { setAddressForm(null); setAddressMode(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {!addressForm ? (
                    <Button 
                      onClick={() => { setAddressForm(emptyAddress); setAddressMode("add"); }}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  ) : (
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Address Line</label>
                        <Input name="line1" value={addressForm.line1} onChange={handleAddressChange} required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">City</label>
                          <Input name="city" value={addressForm.city} onChange={handleAddressChange} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Pincode</label>
                          <Input name="pincode" value={addressForm.pincode} onChange={handleAddressChange} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">State</label>
                          <Input name="state" value={addressForm.state} onChange={handleAddressChange} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Country</label>
                          <Input name="country" value={addressForm.country} onChange={handleAddressChange} required />
                        </div>
                      </div>
                      {addressError && <div className="text-red-600 text-sm">{addressError}</div>}
                      {addressSuccess && <div className="text-green-600 text-sm">{addressSuccess}</div>}
                      <div className="flex gap-2">
                        <Button type="submit" disabled={addressLoading}>
                          {addressLoading ? "Saving..." : (addressMode === "edit" ? "Update Address" : "Add Address")}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => { setAddressForm(null); setAddressMode(null); }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="wishlist" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Wishlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wishlist.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items in wishlist.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishlist.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      <Image 
                        src={item.product.images[0] || '/placeholder.jpg'} 
                        alt={item.product.name} 
                        width={300} 
                        height={200} 
                        className="w-full h-48 object-cover" 
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveFromWishlist(item.product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{item.product.name}</h3>
                      <p className="text-lg font-bold text-primary mb-3">
                        ₹{parseFloat(item.product.price.toString()).toFixed(2)}
                      </p>
                      <Button className="w-full" onClick={() => window.location.href = `/products/${item.product.slug}`}>
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 