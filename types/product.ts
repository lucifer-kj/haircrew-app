export interface Product {
  id: string
  name: string
  description?: string
  price: number
  comparePrice?: number
  images: string[]
  sku: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  slug: string
  categoryId: string
  category?: {
    name: string
  }
  createdAt?: string
  updatedAt?: string
}
