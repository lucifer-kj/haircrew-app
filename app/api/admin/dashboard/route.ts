import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import Logger from '@/lib/logger'
import { dashboardLimiters } from '@/lib/rate-limiter'
import {
  DashboardResponse,
  TimeFilter,
  serializeRecentOrder,
  serializeLowStockProduct
} from '@/types/dashboard'
import { handleApiError } from '@/lib/error-handler'
import { parsePaginationParams, getDateRange } from '@/lib/pagination'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const { success } = await dashboardLimiters.metrics.limit(ip)
  
  if (!success) {
    Logger.warn('Rate limit exceeded', { ip, action: 'dashboard_metrics' })
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429 }
    )
  }

  const token = await getToken({ req: request })
  if (!token || token.role !== 'ADMIN') {
    Logger.security('Unauthorized dashboard access', token?.id, ip)
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const { page, pageSize, filter, offset } = parsePaginationParams(
      new URL(request.url).searchParams
    )
    const { start } = getDateRange(filter)

    // Execute all queries in a transaction
    const [
      { _sum: { total: totalRevenue } },
      totalOrders,
      totalCustomers,
      orders,
      allOrders,
      recentOrdersRaw,
      lowStockRaw
    ] = await prisma.$transaction([
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true, total: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        skip: offset,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.product.findMany({
        where: { stock: { lt: 10 } },
        skip: offset,
        take: pageSize,
        select: { id: true, name: true, stock: true, images: true },
      }),
    ])

    // Top products directly from database
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })
    const topProductIds = topProductsRaw.map(item => item.productId)
    const topProductsMeta = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        stock: true,
        category: { select: { name: true } },
      },
    })
    const topProducts = topProductsRaw.map(item => {
      const meta = topProductsMeta.find(p => p.id === item.productId)
      return {
        id: meta?.id || item.productId,
        name: meta?.name || 'Product',
        image: meta?.images || [],
        price: Number(meta?.price || 0),
        stock: meta?.stock || 0,
        category: meta?.category?.name || 'General',
        totalSold: item._sum.quantity || 0,
        totalRevenue: (item._sum.quantity || 0) * Number(meta?.price || 0),
      }
    })

    // Revenue chart data
    const revenueMap = new Map<string, number>()
    for (const order of orders) {
      let key = ''
      if (filter === 'weekly') {
        const week = format(order.createdAt, 'yyyy-ww')
        key = week
      } else {
        key = format(order.createdAt, 'yyyy-MM')
      }
      revenueMap.set(key, (revenueMap.get(key) || 0) + Number(order.total.toString()))
    }
    const revenueData = Array.from(revenueMap.entries()).map(
      ([date, revenue]: [string, number]) => ({ date, revenue })
    )

    // Order volume data (same as revenue chart, but count orders)
    const volumeMap = new Map<string, number>()
    for (const order of orders) {
      let key = ''
      if (filter === 'weekly') {
        const week = format(order.createdAt, 'yyyy-ww')
        key = week
      } else {
        key = format(order.createdAt, 'yyyy-MM')
      }
      volumeMap.set(key, (volumeMap.get(key) || 0) + 1)
    }
    const volumeData = Array.from(volumeMap.entries()).map(([date, count]: [string, number]) => ({
      date,
      count,
    }))

    // Order status distribution (all orders)
    const statusMap = new Map<string, number>()
    for (const order of allOrders) {
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1)
    }
    const statusData = Array.from(statusMap.entries()).map(
      ([status, count]: [string, number]) => ({ status, count })
    )

    // Peak ordering times (by hour, all orders)
    const hourMap = new Map<string, number>()
    for (const order of allOrders) {
      const hour = format(order.createdAt, 'HH')
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
    }
    const peakTimesData = Array.from(hourMap.entries()).map(
      ([hour, count]: [string, number]) => ({ hour, count })
    )

    // Recent orders table data
    const recentOrders = recentOrdersRaw.map(serializeRecentOrder)

    // Low stock products data
    const lowStockProducts = lowStockRaw.map(serializeLowStockProduct)

    const response: DashboardResponse = {
      metrics: {
        totalRevenue: Number(totalRevenue) || 0,
        totalOrders,
        totalCustomers,
        averageOrderValue: totalOrders > 0 ? Number(totalRevenue) / totalOrders : 0,
      },
      revenueData,
      revenueFilter: filter as TimeFilter,
      orderStats: {
        volumeData,
        statusData,
        peakTimesData,
      },
      recentOrders,
      lowStockProducts,
      topProducts,
      pagination: {
        page,
        pageSize,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, request, token?.id)
  }
} 