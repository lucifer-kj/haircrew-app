import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Aggregate top products by total quantity sold and revenue
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10, // Top 10 products
    })

    // Fetch product details for each top product
    const productIds = topProducts.map((item: { productId: string }) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        stock: true,
        category: { select: { name: true } },
      },
    })

    // Merge aggregated data with product details
    const result = topProducts.map((item: { productId: string; _sum: { quantity: number | null; price: unknown } }) => {
      const product = products.find((p: { id: string }) => p.id === item.productId)
      return {
        id: product?.id,
        name: product?.name,
        images: product?.images,
        price: product?.price,
        stock: product?.stock,
        category: product?.category?.name,
        totalSold: item._sum.quantity || 0,
        totalRevenue:
          item._sum.quantity && item._sum.price
            ? item._sum.quantity * Number(product?.price)
            : 0,
      }
    })

    return NextResponse.json({ topProducts: result })
  } catch (error) {
    console.error('[TOP_PRODUCTS_API_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch top products' },
      { status: 500 }
    )
  }
}
