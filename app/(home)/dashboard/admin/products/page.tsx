'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Package, 
  Plus, 
  Search,
  Download, 
  Loader2,
  Tag,
  AlertTriangle,
  Check,
  Square,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
} from 'lucide-react'
import ProductForm from './product-form'
import CategoryForm from './category-form'
import Image from 'next/image'
import { Product } from '@/types/product'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  slug: string
  isActive: boolean
  _count: {
    products: number
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [stockFilter, setStockFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ])
      
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }
    } catch {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.categoryId === categoryFilter)
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(product => {
        if (statusFilter === 'active') return product.isActive
        if (statusFilter === 'inactive') return !product.isActive
        if (statusFilter === 'featured') return product.isFeatured
        return true
      })
    }

    // Stock filter
    if (stockFilter) {
      filtered = filtered.filter(product => {
        if (stockFilter === 'in-stock') return product.stock > 10
        if (stockFilter === 'low-stock') return product.stock > 0 && product.stock <= 10
        if (stockFilter === 'out-of-stock') return product.stock === 0
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'price':
          cmp = a.price - b.price
          break
        case 'stock':
          cmp = a.stock - b.stock
          break
        case 'createdAt':
          cmp = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [products, searchQuery, categoryFilter, statusFilter, stockFilter, sortBy, sortDir])

  // Filter categories
  const filteredCategories = useMemo(() => {
    let filtered = [...categories]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(category => {
        if (statusFilter === 'active') return category.isActive
        if (statusFilter === 'inactive') return !category.isActive
        return true
      })
    }

    return filtered
  }, [categories, searchQuery, statusFilter])

  // Toggle selection
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const toggleCategorySelection = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
  }

  // Toggle all selection
  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const toggleAllCategories = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(filteredCategories.map(c => c.id)))
    }
  }

  // Bulk actions
  const handleBulkProductAction = async (action: string) => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products to perform bulk action')
      return
    }

    const productIds = Array.from(selectedProducts)
    setIsUpdating('bulk')
    
    try {
      const promises = productIds.map(productId => 
        fetch(`/api/admin/products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            isActive: action === 'activate' ? true : action === 'deactivate' ? false : undefined,
            isFeatured: action === 'feature' ? true : action === 'unfeature' ? false : undefined
          })
        })
      )
      await Promise.all(promises)
      
      toast.success(`${productIds.length} products updated successfully`)
      setSelectedProducts(new Set())
      fetchData()
    } catch {
      toast.error('Failed to update some products')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleBulkCategoryAction = async (action: string) => {
    if (selectedCategories.size === 0) {
      toast.error('Please select categories to perform bulk action')
      return
    }

    const categoryIds = Array.from(selectedCategories)
    setIsUpdating('bulk')
    
    try {
      const promises = categoryIds.map(categoryId => 
        fetch(`/api/admin/categories/${categoryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            isActive: action === 'activate' ? true : action === 'deactivate' ? false : undefined
          })
        })
      )
      await Promise.all(promises)
      
      toast.success(`${categoryIds.length} categories updated successfully`)
      setSelectedCategories(new Set())
      fetchData()
    } catch {
      toast.error('Failed to update some categories')
    } finally {
      setIsUpdating(null)
    }
  }

  // Delete items
  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    setIsUpdating(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast.success('Product deleted successfully')
        fetchData()
      } else {
        toast.error('Failed to delete product')
      }
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setIsUpdating(null)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    setIsUpdating(categoryId)
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast.success('Category deleted successfully')
        fetchData()
      } else {
        toast.error('Failed to delete category')
      }
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setIsUpdating(null)
    }
  }

  // Export data
  const exportData = () => {
    const data = activeTab === 'products' ? filteredProducts : filteredCategories
    const csvContent = activeTab === 'products' 
      ? [
          ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Category', 'Status', 'Featured'],
          ...data.map((item: Product | Category) => [
            item.id,
            item.name,
            'sku' in item && item.sku ? item.sku : 'N/A',
            'price' in item && item.price ? item.price : 'N/A',
            'stock' in item && item.stock ? item.stock : 'N/A',
            'category' in item && item.category?.name ? item.category?.name : 'N/A',
            'isActive' in item && item.isActive ? 'Active' : 'Inactive',
            'isFeatured' in item && item.isFeatured ? 'Yes' : 'No'
          ])
        ]
      : [
          ['ID', 'Name', 'Description', 'Products Count', 'Status'],
          ...data.map((item: Product | Category) => [
            item.id,
            item.name,
            item.description || 'N/A',
            '_count' in item && item._count?.products ? item._count?.products : 0,
            'isActive' in item && item.isActive ? 'Active' : 'Inactive'
          ])
        ]
    
    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success(`${activeTab} exported successfully`)
  }

  // Get status badge
  const getStatusBadge = (isActive: boolean, isFeatured?: boolean) => {
    if (isFeatured) {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Featured</Badge>
    }
    return isActive 
      ? <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      : <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
  }

  // Get stock badge
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>
    }
    if (stock <= 10) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Low Stock</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>
  }

  // Add a fallback for fatal errors or missing data
  if (!products || products.length === undefined) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <p className="text-gray-600">Unable to load products. Please try again later.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.stock > 0 && p.stock <= 10).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">
                  {categories.filter(c => c.isActive).length}
                </p>
              </div>
              <Tag className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Categories ({categories.length})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search ${activeTab}...`}
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
                <option value="">All Status</option>
                {activeTab === 'products' ? (
                  <>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="featured">Featured</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </>
                )}
              </select>

              {/* Category Filter (only for products) */}
              {activeTab === 'products' && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category._count.products})
                    </option>
                  ))}
                </select>
              )}

              {/* Stock Filter (only for products) */}
              {activeTab === 'products' && (
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportData}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                onClick={() => {
                  if (activeTab === 'products') {
                    setEditingProduct(null)
                    setShowProductForm(true)
                  } else {
                    setEditingCategory(null)
                    setShowCategoryForm(true)
                  }
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New {activeTab === 'products' ? 'Product' : 'Category'}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {activeTab === 'products' && selectedProducts.size > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-800">
                  {selectedProducts.size} product(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkProductAction('activate')}
                    disabled={isUpdating === 'bulk'}
                  >
                    {isUpdating === 'bulk' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Activate All'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkProductAction('deactivate')}
                    disabled={isUpdating === 'bulk'}
                  >
                    Deactivate All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkProductAction('feature')}
                    disabled={isUpdating === 'bulk'}
                  >
                    Feature All
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkProductAction('unfeature')}
                    disabled={isUpdating === 'bulk'}
                  >
                    Unfeature All
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && selectedCategories.size > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-800">
                  {selectedCategories.size} category(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkCategoryAction('activate')}
                    disabled={isUpdating === 'bulk'}
                  >
                    {isUpdating === 'bulk' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Activate All'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkCategoryAction('deactivate')}
                    disabled={isUpdating === 'bulk'}
                  >
                    Deactivate All
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      {activeTab === 'products' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-left">
                      <button
                        onClick={toggleAllProducts}
                        className="flex items-center"
                      >
                        {selectedProducts.size === filteredProducts.length ? (
                          <Check className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => {
                          setSortBy('name')
                          setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                        }}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        Name
                        {sortBy === 'name' && (
                          sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-left">SKU</th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => {
                          setSortBy('price')
                          setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                        }}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        Price
                        {sortBy === 'price' && (
                          sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => {
                          setSortBy('stock')
                          setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                        }}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        Stock
                        {sortBy === 'stock' && (
                          sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <button
                          onClick={() => toggleProductSelection(product.id)}
                          className="flex items-center"
                        >
                          {selectedProducts.has(product.id) ? (
                            <Check className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.images[0] && (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {product.sku}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">₹{product.price}</span>
                          {product.comparePrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.comparePrice}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.stock}</span>
                          {getStockBadge(product.stock)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{product.category?.name || 'Unknown'}</Badge>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(product.isActive, product.isFeatured)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduct(product)
                              setShowProductForm(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProduct(product.id)}
                            disabled={isUpdating === product.id}
                          >
                            {isUpdating === product.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">
                  {searchQuery || categoryFilter || statusFilter || stockFilter
                    ? 'Try adjusting your filters or search terms'
                    : 'No products have been added yet'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      {activeTab === 'categories' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-left">
                      <button
                        onClick={toggleAllCategories}
                        className="flex items-center"
                      >
                        {selectedCategories.size === filteredCategories.length ? (
                          <Check className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Products</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(category => (
                    <tr
                      key={category.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <button
                          onClick={() => toggleCategorySelection(category.id)}
                          className="flex items-center"
                        >
                          {selectedCategories.has(category.id) ? (
                            <Check className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {category.image && (
                            <Image
                              src={category.image}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-500">{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {category.description || 'No description'}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{category._count.products} products</Badge>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(category.isActive)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(category)
                              setShowCategoryForm(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCategory(category.id)}
                            disabled={isUpdating === category.id}
                          >
                            {isUpdating === category.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter
                    ? 'Try adjusting your filters or search terms'
                    : 'No categories have been added yet'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Form Modal */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <Dialog.Content className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <Dialog.Title>
            {editingProduct ? 'Edit Product' : 'New Product'}
          </Dialog.Title>
          <ProductForm
            onClose={() => {
              setShowProductForm(false)
              setEditingProduct(null)
            }}
            onSuccess={() => {
              setShowProductForm(false)
              setEditingProduct(null)
              toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully`)
            }}
            initialData={editingProduct ? {
              name: editingProduct.name,
              price: editingProduct.price,
              stock: editingProduct.stock,
              categoryId: editingProduct.categoryId,
              images: editingProduct.images
            } : undefined}
            setProducts={setProducts}
          />
        </Dialog.Content>
      </Dialog>

      {/* Category Form Modal */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <Dialog.Content className="max-w-lg">
          <Dialog.Title>
            {editingCategory ? 'Edit Category' : 'New Category'}
          </Dialog.Title>
          <CategoryForm
            onClose={() => {
              setShowCategoryForm(false)
              setEditingCategory(null)
            }}
            onSuccess={() => {
              setShowCategoryForm(false)
              setEditingCategory(null)
              fetchData()
              toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`)
            }}
            initialData={editingCategory}
          />
        </Dialog.Content>
      </Dialog>
    </>
  )
}
