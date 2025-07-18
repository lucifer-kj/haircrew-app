'use client'

import { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ProductCard from '@/components/product-card'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Category {
  id: string
  name: string
  slug: string
}
interface Product {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
  categoryId: string
}

interface ProductsResponse {
  products: Product[]
  total: number
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string>('all')
  const [stockStatus, setStockStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 9
  const { data: session } = useSession()
  const [wishlist, setWishlist] = useState<string[]>([])
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Check for search parameter from header redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get('search')
    if (searchParam) {
      setSearch(searchParam)
    }
  }, [])

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      let url = `/api/products?page=${currentPage}&pageSize=${pageSize}`
      if (selectedCategory) url += `&category=${selectedCategory}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      if (priceRange !== 'all') url += `&priceRange=${priceRange}`
      if (stockStatus !== 'all') url += `&stockStatus=${stockStatus}`
      if (sortBy !== 'newest') url += `&sortBy=${sortBy}`
      fetch(url)
        .then(res => res.json())
        .then((data: ProductsResponse) => {
          setProducts(Array.isArray(data.products) ? data.products : [])
          setTotal(typeof data.total === 'number' ? data.total : 0)
        })
        .catch(() => {
          setProducts([])
          setTotal(0)
          setError('Error loading products.')
        })
        .finally(() => setLoading(false))
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [selectedCategory, search, priceRange, stockStatus, sortBy, currentPage])

  // Fetch wishlist on load
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/wishlist', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setWishlist(data.map((item: { id: string }) => item.id)))
    }
  }, [session])

  const totalPages = Math.ceil(total / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleWishlist = async (productId: string) => {
    if (!session?.user) return
    setWishlistLoading(productId)
    try {
      if (wishlist.includes(productId)) {
        const response = await fetch('/api/user/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
          credentials: 'include',
        })
        if (response.ok) {
          setWishlist(wishlist.filter(id => id !== productId))
          toast.success('Removed from wishlist')
        } else {
          toast.error('Failed to remove from wishlist')
        }
      } else {
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
          credentials: 'include',
        })
        if (response.ok) {
          setWishlist([...wishlist, productId])
          toast.success('Added to wishlist')
        } else {
          toast.error('Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast.error('Failed to update wishlist')
    } finally {
      setWishlistLoading(null)
    }
  }

  const clearSearch = () => {
    setSearch('')
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  if (loading)
    return (
      <div className="py-12 text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    )
  if (error)
    return (
      <div className="py-12 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    )

  const safeProducts = Array.isArray(products) ? products : []

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 min-h-screen">
        {/* Sidebar */}
        <aside className="md:col-span-1 bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <ul className="space-y-2 mb-6">
            <li>
              <button
                className={`w-full text-left px-2 py-1 rounded ${!selectedCategory ? 'bg-[var(--primary)] text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedCategory(null)}
              >
                All Products
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <button
                  className={`w-full text-left px-2 py-1 rounded ${selectedCategory === cat.id ? 'bg-[var(--primary)] text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mb-3">Price Range</h3>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-500">₹0 - ₹500</SelectItem>
              <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
              <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
              <SelectItem value="2000+">₹2000+</SelectItem>
            </SelectContent>
          </Select>

          <h3 className="text-lg font-semibold mb-3 mt-6">Stock Status</h3>
          <Select value={stockStatus} onValueChange={setStockStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select stock status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-gray-600 mt-1">
                {loading
                  ? 'Loading...'
                  : `${total} product${total !== 1 ? 's' : ''} found`}
                {search && (
                  <span className="ml-2 text-sm text-gray-500">
                    for &quot;{search}&quot;
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-10 max-w-xs"
                />
                {search && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                )}
              </form>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Results Summary */}
          {search && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Showing results for: <strong>&quot;{search}&quot;</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </Button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {safeProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12">
                No products found.
              </div>
            ) : (
              safeProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showWishlist={true}
                  onWishlistToggle={handleWishlist}
                  isInWishlist={wishlist.includes(product.id)}
                  wishlistLoading={wishlistLoading === product.id}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}
