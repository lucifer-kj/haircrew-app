import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { validateInput, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'
import { z } from 'zod'

const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional()
})

// Update a specific category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
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

    const data = validation.data

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

// Delete a specific category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id }
    })

    if (productCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })

    Logger.product('category_deleted', id, session.user.id, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    Logger.error('Category deletion failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 