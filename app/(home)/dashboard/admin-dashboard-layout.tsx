"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Menu, X, LayoutDashboard, ShoppingBag, Package, Users, BarChart2, Settings, IndianRupee } from "lucide-react"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Skeleton } from "@/components/ui/skeleton-loader"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import Image from "next/image"
import { usePusher } from '@/components/providers/socket-provider';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface RevenueDataPoint {
  date: string
  revenue: number
}

interface Metrics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
}

interface OrderStats {
  volumeData: { date: string, count: number }[]
  statusData: { status: string, count: number }[]
  peakTimesData: { hour: string, count: number }[]
}

interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  total: number
  status: string
  date: string
}

interface LowStockProduct {
  id: string
  name: string
  stock: number
  threshold: number
  image?: string
}

interface TopProduct {
  id: string
  name: string
  images: string[]
  price: number
  stock: number
  category?: string
  totalSold: number
  totalRevenue: number
}

interface AdminDashboardLayoutProps {
  children?: React.ReactNode
  metrics?: Metrics
  revenueData?: RevenueDataPoint[]
  revenueFilter?: string
  onRevenueFilterChange?: (filter: string) => void
  orderStats?: OrderStats
  recentOrders?: RecentOrder[]
  lowStockProducts?: LowStockProduct[]
  topProducts?: TopProduct[]
}

export default function AdminDashboardLayout({ children, metrics, revenueData = [], revenueFilter = 'monthly', onRevenueFilterChange, orderStats, recentOrders = [], lowStockProducts = [], topProducts = [] }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'date'|'total'|'status'>('date')
  const [sortDir] = useState<'asc'|'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('')
  // Add state for date range
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value))
  }

  const filterOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ]

  const statusColors = ['#6366f1', '#22c55e', '#f59e42', '#ef4444', '#a3a3a3']

  // Sort and filter orders
  let displayedOrders = [...recentOrders]
  if (statusFilter) {
    displayedOrders = displayedOrders.filter(o => o.status === statusFilter)
  }
  displayedOrders.sort((a, b) => {
    let cmp = 0
    if (sortBy === 'date') cmp = a.date.localeCompare(b.date)
    if (sortBy === 'total') cmp = a.total - b.total
    if (sortBy === 'status') cmp = a.status.localeCompare(b.status)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const statusOptions = Array.from(new Set(recentOrders.map(o => o.status)))

  const { pusher } = usePusher();
  const { showToast } = useToast();
  useEffect(() => {
    if (!pusher) return;
    // Subscribe to a channel (replace 'admin-channel' with your actual channel name)
    const channel = pusher.subscribe('admin-channel');
    const handleNewOrder = (order: { orderNumber: string; user?: { name?: string; email?: string }; total: number }) => {
      showToast(
        `New Order: #${order.orderNumber} from ${order.user?.name || order.user?.email || 'Customer'} (₹${order.total})`,
        'success'
      );
    };
    channel.bind('newOrder', handleNewOrder);
    // Stock update handler
    const handleStockUpdate = (product: { name: string; stock: number }) => {
      showToast(
        `${product.name} stock is now ${product.stock}`,
        product.stock === 0 ? 'error' : product.stock < 10 ? 'info' : 'success'
      );
    };
    channel.bind('stockUpdate', handleStockUpdate);
    return () => {
      channel.unbind('newOrder', handleNewOrder);
      channel.unbind('stockUpdate', handleStockUpdate);
      pusher.unsubscribe('admin-channel');
    };
  }, [pusher, showToast]);

  // Export Orders CSV handler
  const handleExportOrders = async () => {
    const params = [];
    if (dateRange.start) params.push(`start=${dateRange.start}`);
    if (dateRange.end) params.push(`end=${dateRange.end}`);
    const url = `/api/admin/export/orders${params.length ? '?' + params.join('&') : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      showToast('Failed to export orders', 'error');
      return;
    }
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'orders-export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden p-2 rounded-md bg-white/80 shadow-lg backdrop-blur-md"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6 text-primary" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900/95 shadow-lg border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Admin</span>
          <button
            className="md:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-4">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-primary/10 dark:hover:bg-primary/20 font-medium transition"
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-5 w-5 text-primary" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content with error boundary and loading state */}
      <main className="flex-1 ml-0 md:ml-64 p-6 transition-all duration-200">
        <div className="max-w-7xl mx-auto">
          {/* Key Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold text-slate-700 dark:text-white">Total Revenue</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{formatCurrency(metrics.totalRevenue)}</span>
              </div>
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold text-slate-700 dark:text-white">Total Orders</span>
                </div>
                <span className="text-2xl font-bold text-primary">{metrics.totalOrders}</span>
              </div>
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold text-slate-700 dark:text-white">Total Customers</span>
                </div>
                <span className="text-2xl font-bold text-primary">{metrics.totalCustomers}</span>
              </div>
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold text-slate-700 dark:text-white">Avg. Order Value</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{formatCurrency(metrics.averageOrderValue)}</span>
              </div>
            </div>
          )}

          {/* Sales Analytics: Revenue Chart */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Revenue Chart</h2>
              <div className="flex gap-2">
                {filterOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`px-3 py-1 rounded-full font-medium transition border border-primary/30 ${revenueFilter === opt.value ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 text-primary'}`}
                    onClick={() => onRevenueFilterChange && onRevenueFilterChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={formatCurrency} labelStyle={{ color: '#334155' }} contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Statistics Section */}
          {orderStats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Order Volume Bar Chart */}
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Order Volume</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={orderStats.volumeData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip labelStyle={{ color: '#334155' }} contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="count" fill="#6366f1" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Order Status Pie Chart */}
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Order Status Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={orderStats.statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                      {orderStats.statusData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={statusColors[idx % statusColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Peak Ordering Times Bar Chart */}
              <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Peak Ordering Times</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={orderStats.peakTimesData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip labelStyle={{ color: '#334155' }} contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="count" fill="#22c55e" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Orders Table */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8 overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Recent Orders</h2>
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium mr-2">Status:</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded border px-2 py-1">
                  <option value="">All</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/40">
                  <th className="p-2 cursor-pointer" onClick={() => setSortBy('date')}>Date {sortBy==='date' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                  <th className="p-2">Order ID</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2 cursor-pointer" onClick={() => setSortBy('total')}>Total {sortBy==='total' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                  <th className="p-2 cursor-pointer" onClick={() => setSortBy('status')}>Status {sortBy==='status' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-primary/5 transition">
                    <td className="p-2 whitespace-nowrap">{order.date}</td>
                    <td className="p-2 whitespace-nowrap font-mono">{order.orderNumber}</td>
                    <td className="p-2 whitespace-nowrap">{order.customer}</td>
                    <td className="p-2 whitespace-nowrap font-semibold">₹{order.total.toFixed(2)}</td>
                    <td className="p-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                    </td>
                    <td className="p-2 whitespace-nowrap flex gap-2">
                      <button className="px-2 py-1 rounded bg-primary text-white text-xs" title="View">View</button>
                      <button className="px-2 py-1 rounded bg-secondary text-white text-xs" title="Process">Process</button>
                      <button className="px-2 py-1 rounded bg-slate-500 text-white text-xs" title="Update Status">Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedOrders.length === 0 && <div className="text-center py-8 text-slate-500">No orders found.</div>}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">Low Stock Alerts</h2>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No products are low in stock.</div>
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
                      <tr key={product.id} className="border-b hover:bg-primary/5 transition">
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
                        <td className="p-2 whitespace-nowrap font-semibold">{product.stock}</td>
                        <td className="p-2 whitespace-nowrap">{product.threshold}</td>
                        <td className="p-2 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock < product.threshold ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{product.stock < product.threshold ? 'Low' : 'Warning'}</span>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <button className="px-2 py-1 rounded bg-primary text-white text-xs" title="Restock">Restock</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Products Section */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">Top Products</h2>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No top products found.</div>
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
                      <tr key={product.id} className="border-b hover:bg-primary/5 transition">
                        <td className="p-2 whitespace-nowrap flex items-center gap-2">
                          {product.images && product.images[0] && (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={32}
                              height={32}
                              className="rounded object-cover"
                            />
                          )}
                          <span>{product.name}</span>
                        </td>
                        <td className="p-2 whitespace-nowrap">{product.category || '-'}</td>
                        <td className="p-2 whitespace-nowrap font-semibold">{product.totalSold}</td>
                        <td className="p-2 whitespace-nowrap font-semibold">₹{product.totalRevenue.toLocaleString()}</td>
                        <td className="p-2 whitespace-nowrap">{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export & Reports Section */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">Export & Reports</h2>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              {/* Date Range Picker (stub) */}
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
                    className="border rounded px-2 py-1"
                  />
                  <span className="mx-1">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
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
                <button className="px-4 py-2 rounded bg-secondary text-white font-semibold shadow hover:bg-secondary/80 transition" disabled>
                  Export Products (CSV)
                </button>
                <button className="px-4 py-2 rounded bg-slate-500 text-white font-semibold shadow hover:bg-slate-600 transition" disabled>
                  Export Customers (CSV)
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-500">Select a date range and export data as CSV. PDF and advanced reports coming soon.</div>
          </div>

          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-40 w-full mb-6" />}>
              {children || (
                <div className="text-center py-24">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">Welcome, Admin!</h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300">This is your dashboard overview. Use the sidebar to navigate.</p>
                </div>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
} 