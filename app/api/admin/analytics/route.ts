import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import Logger from '@/lib/logger'

// Helper function to get date range based on filter
function getDateRange(filter: string) {
  const now = new Date()
  const start = new Date()
  
  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'last7':
      start.setDate(now.getDate() - 7)
      break
    case 'last30':
      start.setDate(now.getDate() - 30)
      break
    case 'thisMonth':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'thisYear':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      break
    default:
      start.setDate(now.getDate() - 30) // Default to last 30 days
  }
  
  return { start, end: now }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const dateFilter = searchParams.get('dateRange') || 'last30'
    const { start, end } = getDateRange(dateFilter)

    // Base where clause for date filtering
    const dateWhere = {
      createdAt: {
        gte: start,
        lte: end
      }
    }

    // 1. Basic Metrics
    const [totalRevenue, totalOrders, totalCustomers, avgOrderValue] = await Promise.all([
      // Total Revenue
      prisma.order.aggregate({
        where: {
          ...dateWhere,
          status: { not: 'CANCELLED' }
        },
        _sum: {
          total: true
        }
      }),
      
      // Total Orders
      prisma.order.count({
        where: {
          ...dateWhere,
          status: { not: 'CANCELLED' }
        }
      }),
      
      // Total Customers (unique users who placed orders)
      prisma.order.groupBy({
        by: ['userId'],
        where: {
          ...dateWhere,
          status: { not: 'CANCELLED' }
        }
      }).then(result => result.length),
      
      // Average Order Value
      prisma.order.aggregate({
        where: {
          ...dateWhere,
          status: { not: 'CANCELLED' }
        },
        _avg: {
          total: true
        }
      })
    ])

    // 2. Order Status Distribution
    const orderStatusDistribution = await prisma.order.groupBy({
      by: ['status'],
      where: dateWhere,
      _count: {
        id: true
      }
    })

    // 3. Top Products by Revenue
    const topProductsByRevenue = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          ...dateWhere,
          status: { not: 'CANCELLED' }
        }
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: 10
    })

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProductsByRevenue.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, images: true }
        })
        return {
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          image: product?.images[0] || null,
          totalQuantity: item._sum?.quantity || 0,
          totalRevenue: item._sum?.price || 0
        }
      })
    )

    // 4. Sales Over Time (daily for last 30 days)
    const salesOverTime = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        ...dateWhere,
        status: { not: 'CANCELLED' }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // 5. Customer Acquisition (new vs returning)
    const customerAcquisition = await prisma.order.groupBy({
      by: ['userId'],
      where: dateWhere,
      _count: {
        id: true
      }
    })

    // 6. Refunds and Cancellations
    const [refunds, cancellations] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...dateWhere,
          status: 'REFUNDED'
        },
        _sum: {
          total: true
        },
        _count: {
          id: true
        }
      }),
      prisma.order.count({
        where: {
          ...dateWhere,
          status: 'CANCELLED'
        }
      })
    ])

    // 7. Low Stock Products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 10,
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        images: true
      },
      take: 5
    })

    // 8. Out of Stock Products
    const outOfStockProducts = await prisma.product.count({
      where: {
        stock: 0
      }
    })

    const analytics = {
      metrics: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalCustomers,
        avgOrderValue: avgOrderValue._avg.total || 0,
        refunds: refunds._sum.total || 0,
        refundCount: refunds._count.id || 0,
        cancellations,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts
      },
      charts: {
        orderStatusDistribution: orderStatusDistribution.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        salesOverTime: salesOverTime.map(item => ({
          date: item.createdAt.toISOString().split('T')[0],
          revenue: item._sum.total || 0,
          orders: item._count.id
        })),
        topProducts: topProductsWithDetails,
        customerAcquisition: {
          newCustomers: customerAcquisition.filter(c => (c._count?.id || 0) === 1).length,
          returningCustomers: customerAcquisition.filter(c => (c._count?.id || 0) > 1).length
        }
      },
      alerts: {
        lowStockProducts,
        outOfStockCount: outOfStockProducts
      },
      filters: {
        dateRange: dateFilter,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    }

    Logger.info('Analytics fetched', {
      userId: session.user.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json(analytics)
  } catch (e) {
    Logger.error('Analytics fetch failed', e as Error, {
      userId: session?.user?.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 