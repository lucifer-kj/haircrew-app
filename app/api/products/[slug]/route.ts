export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { pusherServer } from '@/lib/pusher-server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (
      !session?.user ||
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { slug } = await params
    const body = await req.json()
    // Zod validation
    const { z } = await import('zod')
    const updateSchema = z.object({ stock: z.number().int().min(0) })
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid stock value', details: parsed.error.errors }, { status: 400 })
    }
    const { stock } = parsed.data
    const product = await prisma.product.update({
      where: { slug },
      data: { stock },
    })
    // Pusher: Notify clients of stock update
    await pusherServer.trigger('products', 'stock-updated', {
      id: product.id,
      name: product.name,
      stock: product.stock,
      slug: product.slug,
    })
    return NextResponse.json(product)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    )
  }
}
