'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { usePusher } from '@/components/providers/socket-provider'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Check,
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Search,
  Filter,
  Loader2,
  Download,
  Clock,
  ChevronUp,
  ChevronDown,
  Square,
  User,
  Calendar,
  CreditCard,
  MapPin,
} from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'

interface OrderItem {
  id: string
  productId: string
  orderId: string
  quantity: number
  price: string
  createdAt: string
  product?: {
    name: string
    images: string[]
    slug: string
  }
}

interface Order {
  id: string
  orderNumber: string
  total: string
  status: string
  createdAt: string
  user: { name: string; email: string }
  orderItems: OrderItem[]
  shippingAddress?:  {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  paymentMethod?: string
  paymentStatus?: string
}

interface AdminOrdersClientProps {
  orders: Order[]
}

export default function AdminOrdersClient({
  orders: initialOrders,
}: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'status' | 'customer'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [displayLimit, setDisplayLimit] = useState(10)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { pusher } = usePusher()

  // Real-time updates
  useEffect(() => {
    if (!pusher) return
    const channel = pusher.subscribe('orders')
    const handleNewOrder = (data: {
      orderId: string
      user: { name: string; email: string }
      total: number
      createdAt: string
    }) => {
      setOrders(prev => [
        {
          id: data.orderId,
          orderNumber: 'NEW',
          total: String(data.total),
          status: 'PENDING',
          createdAt: data.createdAt,
          user: data.user,
          orderItems: [],
        },
        ...prev,
      ])
      toast.success(`New order received: #${data.orderId}`)
    }
    const handleOrderStatusUpdated = (data: {
      orderId: string
      status: string
    }) => {
      setOrders(prev =>
        prev.map(o =>
          o.id === data.orderId ? { ...o, status: data.status } : o
        )
      )
    }
    const handleOrderConfirmed = (data: { orderId: string }) => {
      setOrders(prev =>
        prev.map(o =>
          o.id === data.orderId ? { ...o, status: 'CONFIRMED' } : o
        )
      )
    }
    const handleOrderRefunded = (data: { orderId: string }) => {
      setOrders(prev =>
        prev.map(o =>
          o.id === data.orderId ? { ...o, status: 'REFUNDED' } : o
        )
      )
    }
    channel.bind('new-order', handleNewOrder)
    channel.bind('order-status-updated', handleOrderStatusUpdated)
    channel.bind('order-confirmed', handleOrderConfirmed)
    channel.bind('order-refunded', handleOrderRefunded)
    return () => {
      channel.unbind('new-order', handleNewOrder)
      channel.unbind('order-status-updated', handleOrderStatusUpdated)
      channel.unbind('order-confirmed', handleOrderConfirmed)
      channel.unbind('order-refunded', handleOrderRefunded)
      pusher.unsubscribe('orders')
    }
  }, [pusher]) 

  // Admin actions
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId)
    try {
      const res = await fetch('/api/order/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
        credentials: 'include',
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update order status')
      }
      
      await res.json()
      
      // Update local state
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      
      // Show success message
      const statusMessages = {
        'CONFIRMED': 'Order confirmed and customer notified',
        'PROCESSING': 'Order moved to processing',
        'SHIPPED': 'Order marked as shipped',
        'DELIVERED': 'Order marked as delivered',
        'CANCELLED': 'Order cancelled',
        'REFUNDED': 'Order refunded'
      }
      
      toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'Status updated')
      
    } catch {
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(null)
    }
  }

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedOrders.size === 0) {
      toast.error('Please select orders to perform bulk action')
      return
    }

    const orderIds = Array.from(selectedOrders)
    setIsUpdating('bulk')
    
    try {
      const promises = orderIds.map(orderId => 
        updateOrderStatus(orderId, action)
      )
      await Promise.all(promises)
      
      toast.success(`${orderIds.length} orders updated successfully`)
      setSelectedOrders(new Set())
    } catch {
      toast.error('Failed to update some orders')
    } finally {
      setIsUpdating(null)
    }
  }

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  // Toggle all orders selection
  const toggleAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)))
    }
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="w-3 h-3" /> },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle className="w-3 h-3" /> },
      'PROCESSING': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Package className="w-3 h-3" /> },
      'SHIPPED': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Truck className="w-3 h-3" /> },
      'DELIVERED': { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
      'CANCELLED': { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-3 h-3" /> },
      'REFUNDED': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <RotateCcw className="w-3 h-3" /> },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING']
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 border`}>
        {config.icon}
        {status}
      </Badge>
    )
  }

  // Get available actions for status
  const getAvailableActions = (order: Order) => {
    const actions = []
    
    switch (order.status) {
      case 'PENDING':
        actions.push(
          <Button
            key="confirm"
            size="sm"
            variant="default"
            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
            disabled={isUpdating === order.id}
            className="bg-green-600 hover:bg-green-700"
          >
            {isUpdating === order.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Confirm'
            )}
          </Button>,
          <Button
            key="cancel"
            size="sm"
            variant="destructive"
            onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
            disabled={isUpdating === order.id}
          >
            Cancel
          </Button>
        )
        break
      case 'CONFIRMED':
        actions.push(
          <Button
            key="process"
            size="sm"
            variant="default"
            onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
            disabled={isUpdating === order.id}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating === order.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Process'
            )}
          </Button>
        )
        break
      case 'PROCESSING':
        actions.push(
          <Button
            key="ship"
            size="sm"
            variant="default"
            onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
            disabled={isUpdating === order.id}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUpdating === order.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Ship'
            )}
          </Button>
        )
        break
      case 'SHIPPED':
        actions.push(
          <Button
            key="deliver"
            size="sm"
            variant="default"
            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
            disabled={isUpdating === order.id}
            className="bg-green-600 hover:bg-green-700"
          >
            {isUpdating === order.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Mark Delivered'
            )}
          </Button>
        )
        break
    }
    
    // Add refund option for paid orders
    if (['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status)) {
      actions.push(
        <Button
          key="refund"
          size="sm"
          variant="outline"
          onClick={() => updateOrderStatus(order.id, 'REFUNDED')}
          disabled={isUpdating === order.id}
          className="border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          Refund
        </Button>
      )
    }
    
    return actions
  }

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.user.name?.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query) ||
        order.total.includes(query)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        switch (dateFilter) {
          case 'today':
            return orderDate >= today
          case 'yesterday':
            return orderDate >= yesterday && orderDate < today
          case 'week':
            return orderDate >= lastWeek
          case 'month':
            return orderDate >= lastMonth
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'date':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'total':
          cmp = parseFloat(a.total) - parseFloat(b.total)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'customer':
          cmp = (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [orders, searchQuery, statusFilter, dateFilter, sortBy, sortDir])

  // Limit displayed orders
  const limitedOrders = filteredOrders.slice(0, displayLimit)

  const statusOptions = Array.from(new Set(orders.map(o => o.status)))

  // Export orders
  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'],
      ...limitedOrders.map(order => [
        order.orderNumber,
        order.user.name || 'N/A',
        order.user.email,
        order.total,
        order.status,
        new Date(order.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Orders exported successfully')
  }

  return (
    <>
      {/* Header with Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.status === 'PROCESSING').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders, customers, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status} ({orders.filter(o => o.status === status).length})
                  </option>
                ))}
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {}}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={exportOrders}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.size > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-800">
                  {selectedOrders.size} order(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('CONFIRMED')}
                    disabled={isUpdating === 'bulk'}
                  >
                    {isUpdating === 'bulk' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Confirm All'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('PROCESSING')}
                    disabled={isUpdating === 'bulk'}
                  >
                    Process All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('SHIPPED')}
                    disabled={isUpdating === 'bulk'}
                  >
                    Ship All
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('CANCELLED')}
                    disabled={isUpdating === 'bulk'}
                  >
                    Cancel All
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] md:min-w-0 w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-left">
                    <button
                      onClick={toggleAllOrders}
                      className="flex items-center"
                    >
                      {selectedOrders.size === filteredOrders.length ? (
                        <Check className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => {
                        setSortBy('date')
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      }}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      Date
                      {sortBy === 'date' && (
                        sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left font-medium">Order ID</th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => {
                        setSortBy('customer')
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      }}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      Customer
                      {sortBy === 'customer' && (
                        sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => {
                        setSortBy('total')
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      }}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      Total
                      {sortBy === 'total' && (
                        sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => {
                        setSortBy('status')
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      }}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      Status
                      {sortBy === 'status' && (
                        sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {limitedOrders.map(order => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <button
                        onClick={() => toggleOrderSelection(order.id)}
                        className="flex items-center"
                      >
                        {selectedOrders.has(order.id) ? (
                          <Check className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.user?.name || 'N/A'}</span>
                        <span className="text-sm text-gray-500">{order.user?.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-lg">
                        ₹{parseFloat(order.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsModalOpen(true)
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {getAvailableActions(order)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter || dateFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'No orders have been placed yet'
                }
              </p>
            </div>
          )}

          {/* Load More */}
          {displayLimit < filteredOrders.length && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                onClick={() => setDisplayLimit(prev => prev + 10)}
                className="w-full"
              >
                Load More Orders ({filteredOrders.length - displayLimit} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Content className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <Dialog.Title>Order Details - #{selectedOrder?.orderNumber}</Dialog.Title>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{selectedOrder.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Order Date</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Payment</p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.paymentMethod || 'N/A'} - {selectedOrder.paymentStatus || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.shippingAddress?.city || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{parseFloat(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="flex gap-2 flex-wrap">
                  {getAvailableActions(selectedOrder)}
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog>
    </>
  )
}
