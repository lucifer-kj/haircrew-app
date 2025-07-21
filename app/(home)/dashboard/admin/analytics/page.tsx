'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar, TrendingUp, Users, ShoppingBag, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { SwipeableCard } from '@/components/admin/SwipeableCard'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

interface AnalyticsData {
  metrics: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    avgOrderValue: number
    refunds: number
    refundCount: number
    cancellations: number
    lowStockCount: number
    outOfStockCount: number
  }
  charts: {
    orderStatusDistribution: Array<{ status: string; count: number }>
    salesOverTime: Array<{ date: string; revenue: number; orders: number }>
    topProducts: Array<{
      productId: string
      name: string
      image: string | null
      totalQuantity: number
      totalRevenue: number
    }>
    customerAcquisition: {
      newCustomers: number
      returningCustomers: number
    }
  }
  alerts: {
    lowStockProducts: Array<{
      id: string
      name: string
      stock: number
      images: string[]
    }>
    outOfStockCount: number
  }
  filters: {
    dateRange: string
    startDate: string
    endDate: string
  }
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('last30')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AnalyticsData | null>(null)
  // Fetch analytics data 
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?dateRange=${dateRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        toast.error('Failed to fetch analytics data')
      }
    } catch {
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Metrics data
  const metrics = data ? [
    { label: 'Total Revenue', value: formatCurrency(data.metrics.totalRevenue), icon: <DollarSign className="w-6 h-6 text-green-600" /> },
    { label: 'Total Orders', value: data.metrics.totalOrders.toString(), icon: <ShoppingBag className="w-6 h-6 text-blue-600" /> },
    { label: 'Total Customers', value: data.metrics.totalCustomers.toString(), icon: <Users className="w-6 h-6 text-purple-600" /> },
    { label: 'Avg. Order Value', value: formatCurrency(data.metrics.avgOrderValue), icon: <TrendingUp className="w-6 h-6 text-orange-600" /> },
  ] : [
    { label: 'Total Revenue', value: '₹0', icon: <DollarSign className="w-6 h-6 text-green-600" /> },
    { label: 'Total Orders', value: '0', icon: <ShoppingBag className="w-6 h-6 text-blue-600" /> },
    { label: 'Total Customers', value: '0', icon: <Users className="w-6 h-6 text-purple-600" /> },
    { label: 'Avg. Order Value', value: '₹0', icon: <TrendingUp className="w-6 h-6 text-orange-600" /> },
  ]

  // Add a fallback for fatal errors or missing data
  if (!data && !loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        <p className="text-gray-600">Unable to load analytics. Please try again later.</p>
      </div>
    );
  }

  // Remove early return, use conditional rendering
  let content = null
  if (loading && !data) {
    content = (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  } else {
    content = (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <Button variant="outline" className="flex items-center gap-2 min-h-touch min-w-touch">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchAnalyticsData} disabled={loading} className="min-h-touch min-w-touch">
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> 
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">{m.label}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                </div>
                {m.icon}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Metrics */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Refunds</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(data.metrics.refunds)}
                    </p>
                    <p className="text-xs text-gray-400">{data.metrics.refundCount} orders</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Cancellations</p>
                    <p className="text-xl font-bold text-orange-600">
                      {data.metrics.cancellations}
                    </p>
                    <p className="text-xs text-gray-400">orders</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Stock Alerts</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {data.metrics.lowStockCount + data.metrics.outOfStockCount}
                    </p>
                    <p className="text-xs text-gray-400">products</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {data && data.charts.salesOverTime && data.charts.salesOverTime.length > 0 ? (
                <SalesChart data={data.charts.salesOverTime} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">No sales data</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {data ? (
                <div className="space-y-3">
                  {data.charts.orderStatusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'PENDING' ? 'bg-yellow-500' :
                          item.status === 'CONFIRMED' ? 'bg-blue-500' :
                          item.status === 'PROCESSING' ? 'bg-purple-500' :
                          item.status === 'SHIPPED' ? 'bg-indigo-500' :
                          item.status === 'DELIVERED' ? 'bg-green-500' :
                          item.status === 'CANCELLED' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">{item.status.toLowerCase()}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">[Pie Chart Placeholder]</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products & Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              {data ? (
                <div className="space-y-3">
                  {data.charts.topProducts.slice(0, 5).map((product, index) => (
                    <SwipeableCard key={index}>
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.totalQuantity} sold 2 {formatCurrency(product.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    </SwipeableCard>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">[Bar Chart Placeholder]</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              {data ? (
                <div className="space-y-4">
                  <SwipeableCard>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">New Customers</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {data.charts.customerAcquisition.newCustomers}
                      </span>
                    </div>
                  </SwipeableCard>
                  <SwipeableCard>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">Returning Customers</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {data.charts.customerAcquisition.returningCustomers}
                      </span>
                    </div>
                  </SwipeableCard>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Total: {data.charts.customerAcquisition.newCustomers + data.charts.customerAcquisition.returningCustomers} customers
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">[Bar Chart Placeholder]</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return content
} 

function SalesChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis width={40} tick={{ fontSize: 12 }} />
          <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 