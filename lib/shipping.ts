interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export const getShippingFee = (items: CartItem[]): number => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // Free shipping over ₹1000
  if (subtotal >= 1000) {
    return 0
  }

  // Standard shipping fee
  return 50
}

export const getShippingTime = (): string => {
  const today = new Date()
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + 3) // 3-5 business days

  return deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
