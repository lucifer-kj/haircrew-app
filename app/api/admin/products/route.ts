import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { validateInput, productSchema, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'
import { z } from 'zod'
import type { Session } from 'next-auth'

// Get all products for admin
export async function GET(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const status = searchParams.get('status') || ''
    const stockStatus = searchParams.get('stockStatus') || ''

    const where: Record<string, unknown> = {}

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Status filter
    if (status) {
      if (status === 'active') where.isActive = true
      else if (status === 'inactive') where.isActive = false
      else if (status === 'featured') where.isFeatured = true
    }

    // Stock filter
    if (stockStatus) {
      if (stockStatus === 'in-stock') where.stock = { gt: 10 }
      else if (stockStatus === 'low-stock') where.stock = { gt: 0, lte: 10 }
      else if (stockStatus === 'out-of-stock') where.stock = { lte: 0 }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (e) {
    Logger.error('Admin products fetch failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// Admin product update schema (extends product schema)
const adminProductUpdateSchema = productSchema.extend({
  id: z.string().min(1),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  barcode: z.string().optional(),
})

const deleteProductSchema = z.object({
  id: z.string().min(1),
})

// Create a new product
export async function POST(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(productSchema, body)
    if (!validation.success) {
      Logger.validation('product_creation', body, session.user.id, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    const {
      name,
      description,
      price,
      stock,
      categoryId,
      images,
      sku,
      weight,
      dimensions,
    } = validation.data
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedSku = sku ? sanitizeInput(sku) : ''

    const product = await prisma.product.create({
      data: {
        name: sanitizedName,
        description: description ? sanitizeInput(description) : '',
        price,
        stock: stock ?? 0,
        categoryId,
        images: images ?? [],
        sku: sanitizedSku,
        weight,
        dimensions: dimensions ? sanitizeInput(dimensions) : '',
        isActive: true,
        isFeatured: false,
        slug:
          sanitizedName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      },
    })

    Logger.product('created', product.id, session.user.id, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ data: product }, { status: 201 })
  } catch (e) {
    Logger.error('Product creation failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// Update a product
export async function PATCH(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(adminProductUpdateSchema, body)
    if (!validation.success) {
      Logger.validation('product_update', body, session.user.id, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    const { id, ...data } = validation.data

    // Sanitize string inputs
    const sanitizedData = {
      ...data,
      name: data.name ? sanitizeInput(data.name) : undefined,
      description: data.description
        ? sanitizeInput(data.description)
        : undefined,
      sku: data.sku ? sanitizeInput(data.sku) : undefined,
      dimensions: data.dimensions ? sanitizeInput(data.dimensions) : undefined,
    }

    const product = await prisma.product.update({
      where: { id },
      data: sanitizedData,
    })

    Logger.product('updated', product.id, session.user.id, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ data: product })
  } catch (e) {
    Logger.error('Product update failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// Delete a product
export async function DELETE(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(deleteProductSchema, body)
    if (!validation.success) {
      Logger.validation('product_deletion', body, session.user.id, {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    const { id } = validation.data
    await prisma.product.delete({ where: { id } })

    Logger.product('deleted', id, session.user.id, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    Logger.error('Product deletion failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
