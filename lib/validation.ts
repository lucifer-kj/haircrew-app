import { z } from 'zod'

// User registration and authentication
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Product validation
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .min(0.01, 'Price must be at least ₹0.01')
    .max(100000, 'Price must be less than ₹100,000'),
  comparePrice: z
    .number()
    .positive('Compare price must be positive')
    .optional(),
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock must be less than 10,000'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required'),
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must be less than 50 characters')
    .regex(
      /^[A-Z0-9-]+$/,
      'SKU can only contain uppercase letters, numbers, and hyphens'
    ),
  weight: z.number().positive('Weight must be positive').optional(),
  dimensions: z
    .string()
    .max(100, 'Dimensions must be less than 100 characters')
    .optional(),
})

// Review validation
export const reviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z
    .string()
    .min(3, 'Review title must be at least 3 characters')
    .max(100, 'Review title must be less than 100 characters')
    .trim(),
  comment: z
    .string()
    .min(10, 'Review comment must be at least 10 characters')
    .max(500, 'Review comment must be less than 500 characters')
    .trim(),
})

// Shipping address validation
export const shippingSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'State can only contain letters and spaces'),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode'),
  country: z.string().default('India'),
})

// Order validation
export const orderSchema = z.object({
  method: z.enum(['COD', 'UPI', 'CARD'], {
    errorMap: () => ({ message: 'Please select a valid payment method' }),
  }),
  status: z.enum([
    'pending',
    'payment_pending_confirmation',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
  ]),
  items: z
    .array(
      z.object({
        id: z.string().min(1, 'Product ID is required'),
        name: z.string().min(1, 'Product name is required'),
        price: z.number().positive('Price must be positive'),
        quantity: z
          .number()
          .int()
          .positive('Quantity must be a positive integer'),
      })
    )
    .min(1, 'At least one item is required'),
  shipping: shippingSchema,
})

// Search and filter validation
export const searchSchema = z.object({
  search: z
    .string()
    .max(100, 'Search term must be less than 100 characters')
    .optional(),
  category: z.string().optional(),
  priceRange: z
    .enum(['all', '0-500', '500-1000', '1000-2000', '2000+'])
    .optional(),
  stockStatus: z
    .enum(['all', 'in-stock', 'low-stock', 'out-of-stock'])
    .optional(),
  sortBy: z
    .enum([
      'newest',
      'oldest',
      'price-low',
      'price-high',
      'name-asc',
      'name-desc',
    ])
    .optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
})

// Admin operations validation
export const adminUserUpdateSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
  isActive: z.boolean().optional(),
})

export const adminProductUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
})

// Password reset validation
export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
})

// Utility functions
export const validateInput = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message),
      }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}
