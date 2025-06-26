"use client"

import { useState } from "react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Drawer } from "vaul"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingCart, Trash2 } from "lucide-react"

export default function CartDrawer() {
  const [open, setOpen] = useState(false)
  const { items, removeItem, updateQuantity, clearCart, getTotal, getCount } = useCartStore()

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-6 h-6" />
          {getCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full px-1.5 py-0.5">
              {getCount()}
            </span>
          )}
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Drawer.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Cart
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-12">Your cart is empty.</div>
            ) : (
              items.map(item => (
                <Card key={item.id} className="flex gap-4 items-center">
                  <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
                  <CardContent className="flex-1 p-0">
                    <CardTitle className="text-base font-semibold mb-1">
                      <Link href={`/products/${item.slug}`}>{item.name}</Link>
                    </CardTitle>
                    <div className="text-[var(--primary)] font-bold mb-1">${item.price}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                      <span className="px-2">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</Button>
                    </div>
                  </CardContent>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </Button>
                </Card>
              ))
            )}
          </div>
          <div className="p-4 border-t flex flex-col gap-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <Button asChild disabled={items.length === 0} className="w-full">
              <Link href="/checkout">Go to Checkout</Link>
            </Button>
            {items.length > 0 && (
              <Button variant="outline" onClick={clearCart} className="w-full">Clear Cart</Button>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
} 