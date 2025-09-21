import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { validateInput, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'
import { z } from 'zod'
import type { Session } from 'next-auth'

// Category schema for admin operations
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true)
})

const categoryUpdateSchema = categorySchema.extend({
  id: z.string().min(1)
})

// Get all categories for admin
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
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Status filter
    if (status) {
      if (status === 'active') where.isActive = true
      else if (status === 'inactive') where.isActive = false
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      categories,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (e) {
    Logger.error('Admin categories fetch failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// Create a new category
export async function POST(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(categorySchema, body)
    if (!validation.success) {
      Logger.validation('category_creation', body, session.user.id, {
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

    const { name, description, image, isActive } = validation.data

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedDescription = description ? sanitizeInput(description) : null

    // Generate slug
    const slug = sanitizedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    const category = await prisma.category.create({
      data: {
        name: sanitizedName,
        description: sanitizedDescription,
        image: image || null,
        slug,
        isActive: isActive ?? true
      }
    })

    Logger.product('category_created', category.id, session.user.id, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ data: category }, { status: 201 })
  } catch (e) {
    Logger.error('Category creation failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

// Update a category
export async function PATCH(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validate input using schema
    const validation = validateInput(categoryUpdateSchema, body)
    if (!validation.success) {
      Logger.validation('category_update', body, session.user.id, {
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
      description: data.description ? sanitizeInput(data.description) : undefined
    }

    const category = await prisma.category.update({
      where: { id },
      data: sanitizedData
    })

    Logger.product('category_updated', category.id, session.user.id, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ data: category })
  } catch (e) {
    Logger.error('Category update failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
} 