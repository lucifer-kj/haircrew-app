import { Decimal } from "@prisma/client/runtime/library"
import { format } from 'date-fns'
import { ReactNode } from "react"

export type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type PaginationParams = {
  page: number
  pageSize: number
  filter: TimeFilter
}

// Prisma raw data types (what comes from database)
export type PrismaOrder = {
  id: string
  orderNumber: string
  userId: string
  total: Decimal
  status: string
  paymentStatus: string
  paymentMethod: string | null // Match Prisma's generated type
  createdAt: Date
  updatedAt: Date
  orderItems: PrismaOrderItem[]
}

// Prisma order type for payments (without orderItems)
export type PrismaPaymentOrder = {
  id: string
  orderNumber: string
  userId: string
  total: Decimal
  status: string
  paymentStatus: string
  paymentMethod: string | null
  createdAt: Date
  updatedAt: Date
}

export type PrismaOrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: Decimal
  createdAt: Date
  product?: {
    name: string
    images: string[]
    slug: string
  }
}

// Prisma review type (raw database data)
export type PrismaReview = {
  id: string
  userId: string
  productId: string
  rating: number
  title: string | null
  comment: string | null
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  product: {
    name: string
    slug: string
  }
}

// Client-side serialized types (what components expect)
export type Order = {
  id: string
  orderNumber: string
  userId: string
  total: string
  status: string
  paymentStatus: string
  paymentMethod?: string // Optional string (undefined)
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

// Payment order type (without orderItems)
export type PaymentOrder = {
  id: string
  orderNumber: string
  userId: string
  total: string
  status: string
  paymentStatus: string
  paymentMethod?: string
  createdAt: string
  updatedAt: string
}

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: string
  createdAt: string
  product?: {
    name: string
    images: string[]
    slug: string
  }
}

export type Review = {
  id: string
  userId: string
  productId: string
  rating: number
  title?: string
  comment?: string
  isVerified: boolean
  createdAt: string
  product: {
    name: string
    slug: string
  }
}

// Utility function for type-safe serialization
export function serializeOrder(order: PrismaOrder): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    total: order.total.toString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod ?? undefined, // Convert null to undefined
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    orderItems: order.orderItems.map(serializeOrderItem),
  }
}

// Utility function for payment orders (without orderItems)
export function serializePaymentOrder(order: PrismaPaymentOrder): PaymentOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    total: order.total.toString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod ?? undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

// Utility function for reviews
export function serializeReview(review: PrismaReview): Review {
  return {
    id: review.id,
    userId: review.userId,
    productId: review.productId,
    rating: review.rating,
    title: review.title ?? undefined, // Convert null to undefined
    comment: review.comment ?? undefined, // Convert null to undefined
    isVerified: review.isVerified,
    createdAt: review.createdAt.toISOString(),
    product: review.product,
  }
}

export function serializeOrderItem(item: PrismaOrderItem): OrderItem {
  return {
    id: item.id,
    productId: item.productId,
    orderId: item.orderId,
    quantity: item.quantity,
    price: item.price.toString(),
    createdAt: item.createdAt.toISOString(),
    product: item.product,
  }
}

export type Address = {
  id: string
  userId: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault?: boolean
  createdAt?: string
  updatedAt?: string
}

export type SerializedOrder = Omit<Order, 'total' | 'createdAt' | 'updatedAt' | 'orderItems'> & {
  total: number
  createdAt: string
  updatedAt: string
  orderItems: SerializedOrderItem[]
}

export type SerializedOrderItem = Omit<OrderItem, 'price' | 'createdAt'> & {
  price: number
  createdAt: string
}

// Prisma types for dashboard data
export type PrismaRecentOrder = {
  id: string
  orderNumber: string
  total: Decimal
  status: string
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
}

export type PrismaLowStockProduct = {
  id: string
  name: string
  stock: number
  images: string[]
}

// Client-side types
export type RecentOrder = {
  id: string
  orderNumber: string
  customer: string
  total: number
  status: string
  date: string
}

export type LowStockProduct = {
  id: string
  name: string
  stock: number
  threshold: number
  image?: string
}

// Serialization functions for dashboard data
export function serializeRecentOrder(order: PrismaRecentOrder): RecentOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.user.name || order.user.email || 'Unknown',
    total: Number(order.total.toString()),
    status: order.status,
    date: format(order.createdAt, 'yyyy-MM-dd'),
  }
}

export function serializeLowStockProduct(product: PrismaLowStockProduct): LowStockProduct {
  return {
    id: product.id,
    name: product.name,
    stock: product.stock,
    threshold: 10,
    image: product.images?.[0] || undefined,
  }
}

export type TopProduct = {
  category: string
  totalSold: ReactNode
  totalRevenue: any
  stock: ReactNode
  id: string
  name: string
  image: string
  slug: string
}

export type DashboardResponse = {
  metrics: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    averageOrderValue: number
  }
  revenueData: Array<{ date: string; revenue: number }>
  revenueFilter: TimeFilter
  orderStats: {
    volumeData: Array<{ date: string; count: number }>
    statusData: Array<{ status: string; count: number }>
    peakTimesData: Array<{ hour: string; count: number }>
  }
  recentOrders: RecentOrder[]
  lowStockProducts: LowStockProduct[]
  topProducts: any[] // Consider proper typing
  pagination: {
    page: number
    pageSize: number
  }
}

export type WishlistItem = {
  id: string
  userId: string
  productId: string
  createdAt: Date
  product: {
    id: string
    name: string
    price: Decimal | number
    images: string[]
    slug: string
  }
}

export type ErrorResponse = {
  error: string
  details?: string
}

// Additional component props for better type safety
export interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  format?: 'currency' | 'number' | 'percentage';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Mobile-optimized Order type for admin data tables
export type AdminOrderTableRow = {
  id: string
  customer: string
  status: 'pending' | 'processing' | 'completed'
  amount: number
} 
