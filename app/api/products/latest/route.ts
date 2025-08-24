import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { z } = await import('zod')
    // Optionally support pagination via query params
    // For now, just validate take param if present
    const url = typeof window === 'undefined' ? undefined : window.location.href
    let take = 6
    if (url) {
      const searchParams = new URL(url).searchParams
      const takeParam = searchParams.get('take')
      if (takeParam) {
        const takeSchema = z.string().regex(/^\d+$/)
        const parsed = takeSchema.safeParse(takeParam)
        if (parsed.success) {
          take = parseInt(takeParam, 10)
        }
      }
    }
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        slug: true,
        categoryId: true,
      },
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch latest products' },
      { status: 500 }
    )
  }
}
