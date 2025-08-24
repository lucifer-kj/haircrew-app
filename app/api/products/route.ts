export const revalidate = 60
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { z } = await import('zod')
    const { searchParams } = new URL(req.url)
    const querySchema = z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      priceRange: z.enum(['all', '0-500', '500-1000', '1000-2000', '2000+']).optional(),
      stockStatus: z.enum(['all', 'in-stock', 'low-stock', 'out-of-stock']).optional(),
      sortBy: z.enum(['newest', 'oldest', 'price-low', 'price-high', 'name-asc', 'name-desc']).optional(),
      page: z.string().regex(/^\d+$/).optional(),
      pageSize: z.string().regex(/^\d+$/).optional(),
    })
    const queryObj = Object.fromEntries(searchParams.entries())
    const parsed = querySchema.safeParse(queryObj)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query params', details: parsed.error.errors }, { status: 400 })
    }
    const {
      stockStatus,
      sortBy = 'newest',
      page = '1',
      pageSize = '9',
    } = parsed.data

    // Convert page and pageSize to numbers
    const pageNum = Number(page)
    const pageSizeNum = Number(pageSize)

    // Initialize where object for filters
    const where: Record<string, unknown> = {};

    // Stock status filter
    if (stockStatus && stockStatus !== 'all') {
      switch (stockStatus) {
        case 'in-stock':
          where.stock = { gt: 10 }
          break
        case 'low-stock':
          where.stock = { gt: 0, lte: 10 }
          break
        case 'out-of-stock':
          where.stock = { lte: 0 }
          break
      }
    }

    // Sorting
    let orderBy: {
      createdAt?: 'asc' | 'desc'
      price?: 'asc' | 'desc'
      name?: 'asc' | 'desc'
    } = {}
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'name-asc':
        orderBy = { name: 'asc' }
        break
      case 'name-desc':
        orderBy = { name: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }
    // Fetch products from the database
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
      }),
      prisma.product.count({ where }),
    ])
    return NextResponse.json({ products, total })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
