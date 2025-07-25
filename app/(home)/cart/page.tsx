'use client'

import { useCartStore } from '@/store/cart-store'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore()
  return (
    <div className="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Cart</h1>
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <span className="text-5xl mb-4">🛒</span>
          <p className="mb-4">Your cart is empty.</p>
          <Link href="/products">
            <Button className="bg-secondary text-white rounded-full px-6 py-2 font-semibold shadow-md hover:bg-secondary/90 transition">
              Shop Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className="flex gap-3 items-center bg-white rounded-lg shadow-sm p-3 border"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={64}
                height={64}
                className="rounded object-cover border w-16 h-16"
              />
              <div className="flex-1">
                <div className="font-semibold text-base mb-1 line-clamp-1">
                  {item.name}
                </div>
                <div className="text-secondary font-bold mb-1 text-xs">
                  ₹{item.price}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-full border border-secondary text-secondary font-bold flex items-center justify-center text-lg bg-white hover:bg-secondary/10 transition"
                    aria-label="Decrease quantity"
                  >
                    -
                  </Button>
                  <span className="px-2 font-medium text-xs">
                    {item.quantity}
                  </span>
                  <Button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-8 h-8 rounded-full border border-secondary text-secondary font-bold flex items-center justify-center text-lg bg-white hover:bg-secondary/10 transition"
                    aria-label="Increase quantity"
                  >
                    +
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent hover:bg-red-50 transition"
                aria-label="Remove from cart"
              >
                ✕
              </Button>
            </div>
          ))}
          <div className="rounded-lg border bg-gray-50 p-4 mt-4">
            <div className="flex items-center justify-between text-base font-semibold mb-2">
              <span>Subtotal</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold mt-2">
              <span>Total</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full bg-secondary hover:bg-secondary/90 text-white text-base font-semibold py-3 rounded-full shadow-md mt-4">
            Go to Checkout
          </Button>
          <Button
            onClick={clearCart}
            className="w-full mt-2 border border-secondary text-secondary bg-white hover:bg-secondary/10 font-semibold rounded-full py-3 transition"
          >
            Clear Cart
          </Button>
        </div>
      )}
    </div>
  )
}
