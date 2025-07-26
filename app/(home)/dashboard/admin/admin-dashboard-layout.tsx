'use client'

import { useState, Suspense, useMemo, useCallback } from 'react'
import {
  IndianRupee,
  ShoppingBag,
  Users,
  BarChart2,
} from 'lucide-react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Skeleton } from '@/components/ui/skeleton-loader'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import Image from 'next/image'
import { usePusher } from '@/components/providers/socket-provider'
import { useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import MetricCard from '@/components/dashboard/MetricCard'
import DataTable from '@/components/dashboard/DataTable'
import { 
  DashboardResponse,
  RecentOrder, 
  LowStockProduct, 
  TopProduct
} from '@/types/dashboard'

interface AdminDashboardLayoutProps {
  children?: React.ReactNode
  metrics?: DashboardResponse['metrics']
  revenueData?: DashboardResponse['revenueData']
  revenueFilter?: string
  onRevenueFilterChange?: (filter: string) => void
  orderStats?: DashboardResponse['orderStats']
  recentOrders?: RecentOrder[]
  lowStockProducts?: LowStockProduct[]
  topProducts?: TopProduct[]
}

export default function AdminDashboardLayout({
  children,
  metrics,
  revenueData = [],
  revenueFilter = 'monthly',
  onRevenueFilterChange,
  orderStats,
  recentOrders = [],
  lowStockProducts = [],
  topProducts = [],
}: AdminDashboardLayoutProps) {
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'status'>('date')
  const [sortDir] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [displayLimit, setDisplayLimit] = useState(5)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  })

  // Format currency with useCallback for performance
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value))
  }, [])

  const filterOptions = useMemo(() => [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ], [])

  const statusColors = useMemo(() => ['#6366f1', '#22c55e', '#f59e42', '#ef4444', '#a3a3a3'], [])

  // Sort and filter orders with useMemo for performance
  const displayedOrders = useMemo(() => {
    let filtered = [...recentOrders]
  if (statusFilter) {
      filtered = filtered.filter(o => o.status === statusFilter)
  }
    filtered.sort((a, b) => {
    let cmp = 0
    if (sortBy === 'date') cmp = a.date.localeCompare(b.date)
    if (sortBy === 'total') cmp = a.total - b.total
    if (sortBy === 'status') cmp = a.status.localeCompare(b.status)
    return sortDir === 'asc' ? cmp : -cmp
  })
    return filtered
  }, [recentOrders, statusFilter, sortBy, sortDir])
  
  // Limit displayed orders for dashboard
  const limitedOrders = useMemo(() => 
    displayedOrders.slice(0, displayLimit), 
    [displayedOrders, displayLimit]
  )

  const statusOptions = useMemo(() => 
    Array.from(new Set(recentOrders.map(o => o.status))), 
    [recentOrders]
  )

  // Define table columns with useMemo
  const orderColumns: Array<{
    header: string;
    accessorKey: keyof RecentOrder;
    cell?: (info: { getValue: () => unknown; row: { original: RecentOrder } }) => React.ReactNode;
    sortable?: boolean;
    width?: string;
  }> = [
    {
      header: 'Date',
      accessorKey: 'date',
      sortable: true,
    },
    {
      header: 'Order ID',
      accessorKey: 'orderNumber',
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
    },
    {
      header: 'Total',
      accessorKey: 'total',
      sortable: true,
      cell: ({ getValue }: { getValue: () => unknown }) => formatCurrency(getValue() as number),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: ({ getValue }: { getValue: () => unknown }) => {
        const status = getValue() as string
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              status === 'DELIVERED' 
                ? 'bg-green-100 text-green-700' 
                : status === 'CANCELLED' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {status}
          </span>
        )
      },
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: () => (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded bg-primary text-white text-xs"
            title="View"
          >
            View
          </button>
          <button
            className="px-2 py-1 rounded bg-secondary text-white text-xs"
            title="Process"
          >
            Process
          </button>
          <button
            className="px-2 py-1 rounded bg-slate-500 text-white text-xs"
            title="Update Status"
          >
            Update
          </button>
        </div>
      ),
    },
  ]

  const { pusher } = usePusher()
  const { showToast } = useToast()
  
  useEffect(() => {
    if (!pusher) return
    const channel = pusher.subscribe('admin-channel')
    const handleNewOrder = (order: {
      orderNumber: string
      user?: { name?: string; email?: string }
      total: number
    }) => {
      showToast(
        `New Order: #${order.orderNumber} from ${order.user?.name || order.user?.email || 'Customer'} (₹${order.total})`,
        'success'
      )
    }
    const handleStockUpdate = (product: { name: string; stock: number }) => {
      showToast(
        `${product.name} stock is now ${product.stock}`,
        product.stock === 0 ? 'error' : product.stock < 10 ? 'info' : 'success'
      )
    }
    channel.bind('newOrder', handleNewOrder)
    channel.bind('stockUpdate', handleStockUpdate)
    return () => {
      channel.unbind('newOrder', handleNewOrder)
      channel.unbind('stockUpdate', handleStockUpdate)
      pusher.unsubscribe('admin-channel')
    }
  }, [pusher, showToast])

  // Export Orders CSV handler with useCallback
  const handleExportOrders = useCallback(async () => {
    const params = []
    if (dateRange.start) params.push(`start=${dateRange.start}`)
    if (dateRange.end) params.push(`end=${dateRange.end}`)
    const url = `/api/admin/export/orders${params.length ? '?' + params.join('&') : ''}`
    const res = await fetch(url)
    if (!res.ok) {
      showToast('Failed to export orders', 'error')
      return
    }
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'orders-export.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [dateRange, showToast])

  // Handle sort changes with useCallback
  const handleSort = useCallback((key: keyof RecentOrder) => {
    setSortBy(key as 'date' | 'total' | 'status')
  }, [])

  return (
    <div className="w-full max-w-full px-2 sm:px-4">
      {/* Welcome Section - Only show when no children */}
      {!children && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Welcome, Admin!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            This is your dashboard overview. Use the sidebar to navigate.
          </p>
        </div>
      )}

          {/* Key Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full max-w-full">
              <MetricCard
                icon={<IndianRupee className="h-6 w-6" />}
                title="Total Revenue"
                value={metrics.totalRevenue}
                format="currency"
              />
              <MetricCard
                icon={<ShoppingBag className="h-6 w-6" />}
                title="Total Orders"
                value={metrics.totalOrders}
                format="number"
              />
              <MetricCard
                icon={<Users className="h-6 w-6" />}
                title="Total Customers"
                value={metrics.totalCustomers}
                format="number"
              />
              <MetricCard
                icon={<BarChart2 className="h-6 w-6" />}
                title="Avg. Order Value"
                value={metrics.averageOrderValue}
                format="currency"
              />
            </div>
          )}

          {/* Sales Analytics: Revenue Chart */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8 w-full max-w-full overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Revenue Chart
              </h2>
              <div className="flex gap-2">
                {filterOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`px-3 py-1 rounded-full font-medium transition border border-primary/30 ${revenueFilter === opt.value ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 text-primary'}`}
                    onClick={() =>
                      onRevenueFilterChange && onRevenueFilterChange(opt.value)
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={revenueData}
                margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={formatCurrency}
                  labelStyle={{ color: '#334155' }}
                  contentStyle={{
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Statistics Section */}
          {orderStats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 w-full max-w-full">
              {/* Order Volume Bar Chart */}
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Order Volume
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={orderStats.volumeData}
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      labelStyle={{ color: '#334155' }}
                      contentStyle={{
                        background: '#fff',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Order Status Pie Chart */}
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Order Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={orderStats.statusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {orderStats.statusData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={statusColors[idx % statusColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Peak Ordering Times Bar Chart */}
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Peak Ordering Times
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={orderStats.peakTimesData}
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      labelStyle={{ color: '#334155' }}
                      contentStyle={{
                        background: '#fff',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <Bar dataKey="count" fill="#22c55e" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Orders Table */}
          <DataTable
            columns={orderColumns}
            data={limitedOrders}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            filters={{
              status: statusFilter,
              onStatusChange: setStatusFilter,
              statusOptions,
            }}
          />
            {displayedOrders.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No orders found.
              </div>
            )}
          {displayLimit < recentOrders.length && (
            <div className="text-center mt-4">
              <button
                className="px-4 py-2 rounded bg-primary text-white font-semibold shadow hover:bg-primary/80 transition"
                onClick={() => setDisplayLimit(prev => prev + 5)}
              >
                Load More Orders
              </button>
          </div>
          )}

          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8 w-full max-w-full overflow-x-auto">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Low Stock Alerts
            </h2>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No products are low in stock.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900/40">
                      <th className="p-2">Product</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Threshold</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map(product => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-primary/5 transition"
                      >
                        <td className="p-2 whitespace-nowrap flex items-center gap-2">
                          {product.image && (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={32}
                              height={32}
                              className="rounded object-cover"
                            />
                          )}
                          <span>{product.name}</span>
                        </td>
                        <td className="p-2 whitespace-nowrap font-semibold">
                          {product.stock}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {product.threshold}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock < product.threshold ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                          >
                            {product.stock < product.threshold
                              ? 'Low'
                              : 'Warning'}
                          </span>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <button
                            className="px-2 py-1 rounded bg-primary text-white text-xs"
                            title="Restock"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Products Section */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8 w-full max-w-full overflow-x-auto">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Top Products
            </h2>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No top products found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900/40">
                      <th className="p-2">Product</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Total Sold</th>
                      <th className="p-2">Revenue</th>
                      <th className="p-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map(product => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-primary/5 transition"
                      >
                        <td className="p-2 whitespace-nowrap flex items-center gap-2">
                          {product.image && product.image[0] && (
                            <Image
                              src={product.image[0]}
                              alt={product.name}
                              width={32}
                              height={32}
                              className="rounded object-cover"
                            />
                          )}
                          <span>{product.name}</span>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {product.category || '-'}
                        </td>
                        <td className="p-2 whitespace-nowrap font-semibold">
                          {product.totalSold}
                        </td>
                        <td className="p-2 whitespace-nowrap font-semibold">
                          ₹{product.totalRevenue.toLocaleString()}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {product.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export & Reports Section */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8 w-full max-w-full overflow-x-auto">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Export & Reports
            </h2>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              {/* Date Range Picker (stub) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e =>
                      setDateRange(r => ({ ...r, start: e.target.value }))
                    }
                    className="border rounded px-2 py-1"
                  />
                  <span className="mx-1">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e =>
                      setDateRange(r => ({ ...r, end: e.target.value }))
                    }
                    className="border rounded px-2 py-1"
                  />
                </div>
              </div>
              {/* Export Buttons (stub) */}
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded bg-primary text-white font-semibold shadow hover:bg-primary/80 transition"
                  onClick={handleExportOrders}
                >
                  Export Orders (CSV)
                </button>
                <button
                  className="px-4 py-2 rounded bg-secondary text-white font-semibold shadow hover:bg-secondary/80 transition"
                  disabled
                >
                  Export Products (CSV)
                </button>
                <button
                  className="px-4 py-2 rounded bg-slate-500 text-white font-semibold shadow hover:bg-slate-600 transition"
                  disabled
                >
                  Export Customers (CSV)
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Select a date range and export data as CSV. PDF and advanced
              reports coming soon.
            </div>
          </div>

          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-40 w-full mb-6" />}>
              {children}
            </Suspense>
          </ErrorBoundary>
    </div>
  )
}
