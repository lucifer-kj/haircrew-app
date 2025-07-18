'use server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminDashboardLayout from './admin-dashboard-layout'
import { PusherProvider } from '@/components/providers/socket-provider'

import { format } from 'date-fns'
import React from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import Logger from '@/lib/logger'

function getStartDate(filter: string) {
  const now = new Date()
  switch (filter) {
    case 'daily':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
    case 'weekly':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() - 12, 1)
    case 'yearly':
      return new Date(now.getFullYear() - 5, 0, 1)
    default:
      return new Date(now.getFullYear(), now.getMonth() - 12, 1)
  }
}

function getDateFormat(filter: string) {
  switch (filter) {
    case 'daily':
      return 'yyyy-MM-dd'
    case 'weekly':
      return 'yyyy-ww'
    case 'monthly':
      return 'yyyy-MM'
    case 'yearly':
      return 'yyyy'
    default:
      return 'yyyy-MM'
  }
}

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardPage(props: DashboardPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if ((session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/')
  }

  // Await searchParams as it's now a Promise
  const searchParams = (await props.searchParams) || {}
  const filter =
    typeof searchParams.filter === 'string' ? searchParams.filter : undefined
  const safeFilter = filter || 'monthly'
  const startDate = getStartDate(safeFilter)
  const dateFormat = getDateFormat(safeFilter)

  // Add try/catch for error boundary and loading state
  try {
    // Fetch key metrics and orders
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      orders,
      allOrders,
      recentOrdersRaw,
      lowStockRaw,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, total: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        take: 10,
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
        select: { id: true, name: true, stock: true, images: true },
      }),
    ])

    // Fetch top products from API (use relative path)
    const topProductsRes = await fetch('/api/admin/top-products', {
      cache: 'no-store',
    })
    if (!topProductsRes.ok) {
      throw new Error('Failed to fetch top products')
    }
    const { topProducts } = await topProductsRes.json()
    const revenue = Number(totalRevenue._sum.total) || 0
    const ordersCount = totalOrders || 0
    const customers = totalCustomers || 0
    const averageOrderValue = ordersCount > 0 ? revenue / ordersCount : 0

    // Revenue chart data
    const revenueMap = new Map<string, number>()
    for (const order of orders) {
      let key = ''
      if (safeFilter === 'weekly') {
        const week = format(order.createdAt, 'yyyy-ww')
        key = week
      } else {
        key = format(order.createdAt, dateFormat)
      }
      revenueMap.set(key, (revenueMap.get(key) || 0) + Number(order.total))
    }
    const revenueData = Array.from(revenueMap.entries()).map(
      ([date, revenue]) => ({ date, revenue })
    )

    // Order volume data (same as revenue chart, but count orders)
    const volumeMap = new Map<string, number>()
    for (const order of orders) {
      let key = ''
      if (safeFilter === 'weekly') {
        const week = format(order.createdAt, 'yyyy-ww')
        key = week
      } else {
        key = format(order.createdAt, dateFormat)
      }
      volumeMap.set(key, (volumeMap.get(key) || 0) + 1)
    }
    const volumeData = Array.from(volumeMap.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    // Order status distribution (all orders)
    const statusMap = new Map<string, number>()
    for (const order of allOrders) {
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1)
    }
    const statusData = Array.from(statusMap.entries()).map(
      ([status, count]) => ({ status, count })
    )

    // Peak ordering times (by hour, all orders)
    const hourMap = new Map<string, number>()
    for (const order of allOrders) {
      const hour = format(order.createdAt, 'HH')
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
    }
    const peakTimesData = Array.from(hourMap.entries()).map(
      ([hour, count]) => ({ hour, count })
    )

    // Recent orders table data
    const recentOrders = recentOrdersRaw.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user?.name || order.user?.email || 'Unknown',
      total: Number(order.total),
      status: order.status,
      date: format(order.createdAt, 'yyyy-MM-dd'),
    }))

    const lowStockProducts = lowStockRaw.map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      threshold: 10,
      image: product.images?.[0] || undefined,
    }))

    // Handler for filter change (client navigation)
    async function handleRevenueFilterChange(nextFilter: string) {
      'use server'
      redirect(`/dashboard?filter=${nextFilter}`)
    }

    return (
      <PusherProvider>
        {/* Error boundary and loading state wrapper */}
        <ErrorBoundary>
          <React.Suspense
            fallback={<div className="p-8">Loading dashboard...</div>}
          >
            <AdminDashboardLayout
              metrics={{
                totalRevenue: revenue,
                totalOrders: ordersCount,
                totalCustomers: customers,
                averageOrderValue,
              }}
              revenueData={revenueData}
              revenueFilter={safeFilter}
              onRevenueFilterChange={handleRevenueFilterChange}
              orderStats={{
                volumeData,
                statusData,
                peakTimesData,
              }}
              recentOrders={recentOrders}
              lowStockProducts={lowStockProducts}
              topProducts={topProducts}
            />
          </React.Suspense>
        </ErrorBoundary>
      </PusherProvider>
    )
  } catch (error) {
    Logger.error('Error in DashboardPage:', error as Error)
    return (
      <div className="p-8 text-red-600">
        An error occurred while loading the dashboard. Please try again later.
      </div>
    )
  }
}
