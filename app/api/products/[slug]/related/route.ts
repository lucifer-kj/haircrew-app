export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        slug: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(relatedProducts)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    )
  }
}
