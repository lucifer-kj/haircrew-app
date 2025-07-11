"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Drawer } from "vaul"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingCart, Trash2 } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { AnimatePresence, motion } from "framer-motion";
import { cartSlideIn } from "@/lib/motion.config";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function CartDrawer() {
  const [open, setOpen] = useState(false)
  const { items, removeItem, updateQuantity, clearCart, getTotal, getCount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const reduced = useReducedMotion();

  useEffect(() => { setMounted(true) }, [])

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-6 h-6" />
          {mounted && getCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full px-1.5 py-0.5">
              {getCount()}
            </span>
          )}
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <AnimatePresence>
          {open && (
            <motion.aside
              key="cart-drawer"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={reduced ? undefined : cartSlideIn}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50"
            >
              <Drawer.Title asChild>
                <VisuallyHidden>Cart</VisuallyHidden>
              </Drawer.Title>
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" /> Cart
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {items.length === 0 ? (
                  <div className="text-center text-gray-500 py-16">Your cart is empty.</div>
                ) : (
                  <div className="space-y-6">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4 items-center bg-white rounded-lg shadow-sm p-4 border">
                        <Image src={item.image} alt={item.name} width={72} height={72} className="rounded-md object-cover border" />
                        <div className="flex-1">
                          <div className="font-semibold text-base mb-1">
                            <Link href={`/products/${item.slug}`}>{item.name}</Link>
                          </div>
                          <div className="text-[var(--primary)] font-bold mb-1">₹{item.price}</div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                            <span className="px-2 font-medium">{item.quantity}</span>
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</Button>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t bg-white">
                <div className="rounded-lg border bg-gray-50 p-4 mb-4">
                  <div className="flex items-center justify-between text-base font-semibold mb-2">
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
                <Button asChild disabled={items.length === 0} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold py-3 rounded-md shadow-md">
                  <Link href="/checkout">Go to Checkout</Link>
                </Button>
                {items.length > 0 && (
                  <Button variant="outline" onClick={clearCart} className="w-full mt-2">Clear Cart</Button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </Drawer.Portal>
    </Drawer.Root>
  )
} 