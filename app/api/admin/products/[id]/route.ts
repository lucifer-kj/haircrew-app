import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { validateInput, sanitizeInput } from '@/lib/validation'
import Logger from '@/lib/logger'
import { z } from 'zod'

const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  sku: z.string().min(1).max(50).optional(),
  barcode: z.string().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional()
})

// Update a specific product
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
    const validation = validateInput(productUpdateSchema, body)
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

    const data = validation.data

    // Sanitize string inputs
    const sanitizedData = {
      ...data,
      name: data.name ? sanitizeInput(data.name) : undefined,
      description: data.description ? sanitizeInput(data.description) : undefined,
      sku: data.sku ? sanitizeInput(data.sku) : undefined,
      barcode: data.barcode ? sanitizeInput(data.barcode) : undefined,
      dimensions: data.dimensions ? sanitizeInput(data.dimensions) : undefined
    }

    const product = await prisma.product.update({
      where: { id },
      data: sanitizedData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
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

// Delete a specific product
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

    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders' },
        { status: 400 }
      )
    }

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