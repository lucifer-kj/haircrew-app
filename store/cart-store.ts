import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
  quantity: number
  stock: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
}

const CART_KEY = 'haircrew_cart'

const loadCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(CART_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  addItem: (item, quantity = 1) => {
    set(state => {
      const existing = state.items.find(i => i.id === item.id)
      let newItems
      if (existing) {
        newItems = state.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
            : i
        )
      } else {
        newItems = [
          ...state.items,
          { ...item, quantity: Math.min(quantity, item.stock) },
        ]
      }
      saveCart(newItems)
      return { items: newItems }
    })
  },
  removeItem: id => {
    set(state => {
      const newItems = state.items.filter(i => i.id !== id)
      saveCart(newItems)
      return { items: newItems }
    })
  },
  updateQuantity: (id, quantity) => {
    set(state => {
      const newItems = state.items.map(i =>
        i.id === id
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
          : i
      )
      saveCart(newItems)
      return { items: newItems }
    })
  },
  clearCart: () => {
    saveCart([])
    set({ items: [] })
  },
  getTotal: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  },
  getCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0)
  },
}))

// Listen for storage events to sync cart across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key === CART_KEY) {
      useCartStore.setState({ items: loadCart() })
    }
  })
}
