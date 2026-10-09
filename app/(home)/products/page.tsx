'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, RotateCcw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ProductCard, { ProductCardSkeleton } from '@/components/product-card'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

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
  stock?: number
}

interface ProductsResponse {
  products: Product[]
  total: number
}

function ProductsContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string>('all')
  const [stockStatus, setStockStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const pageSize = 12
  const { data: session } = useSession()
  const [wishlist, setWishlist] = useState<string[]>([])
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
  }, [])

  // Hydrate search and category from URL query parameters
  useEffect(() => {
    const searchParam = searchParams.get('search')
    const categoryParam = searchParams.get('category')
    if (searchParam) {
      setSearch(searchParam)
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Fetch products with debounced parameters
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      let url = `/api/products?page=${currentPage}&pageSize=${pageSize}`
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      if (priceRange !== 'all') url += `&priceRange=${priceRange}`
      if (stockStatus !== 'all') url += `&stockStatus=${stockStatus}`
      if (sortBy !== 'newest') url += `&sortBy=${sortBy}`

      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load products')
          return res.json()
        })
        .then((data: ProductsResponse) => {
          setProducts(Array.isArray(data.products) ? data.products : [])
          setTotal(typeof data.total === 'number' ? data.total : 0)
        })
        .catch(() => {
          setProducts([])
          setTotal(0)
          setError('Unable to load products. Please check your connection and try again.')
        })
        .finally(() => setLoading(false))
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [selectedCategory, search, priceRange, stockStatus, sortBy, currentPage])

  // Fetch wishlist
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/wishlist', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setWishlist(Array.isArray(data) ? data.map((item: { id: string }) => item.id) : []))
        .catch(() => setWishlist([]))
    }
  }, [session])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleWishlist = async (productId: string) => {
    if (!session?.user) {
      toast.error('Please sign in to save items to your wishlist')
      return
    }
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

  const clearAllFilters = () => {
    setSelectedCategory(null)
    setPriceRange('all')
    setStockStatus('all')
    setSearch('')
    setSortBy('newest')
    setCurrentPage(1)
  }

  const activeFiltersCount = [
    selectedCategory !== null,
    priceRange !== 'all',
    stockStatus !== 'all',
    search.trim() !== '',
  ].filter(Boolean).length

  const handleProductHover = (slug: string) => {
    if (typeof window !== 'undefined') {
      router.prefetch(`/products/${slug}`)
    }
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Salon Care Collection
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {loading
                ? 'Searching curated salon formulations...'
                : `${total} premium formulation${total !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {/* Quick Actions (Search, Sort, Mobile Filter Button) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden flex items-center gap-2 rounded-xl border-input"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Input
                type="search"
                placeholder="Search formulations..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pr-8 rounded-xl bg-background border-input"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setCurrentPage(1)
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <Select
              value={sortBy}
              onValueChange={val => {
                setSortBy(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[170px] rounded-xl border-input bg-background">
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

            {/* Reset Filters button if any active */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-primary gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-muted/40 rounded-xl border border-border/50 text-xs">
            <span className="font-semibold text-muted-foreground">Active Filters:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg bg-background border border-border">
                Category: {categories.find(c => c.id === selectedCategory || c.slug === selectedCategory)?.name || selectedCategory}
                <button onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}>
                  <X className="w-3 h-3 hover:text-destructive" />
                </button>
              </Badge>
            )}
            {priceRange !== 'all' && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg bg-background border border-border">
                Price: {priceRange}
                <button onClick={() => { setPriceRange('all'); setCurrentPage(1); }}>
                  <X className="w-3 h-3 hover:text-destructive" />
                </button>
              </Badge>
            )}
            {stockStatus !== 'all' && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg bg-background border border-border">
                Stock: {stockStatus}
                <button onClick={() => { setStockStatus('all'); setCurrentPage(1); }}>
                  <X className="w-3 h-3 hover:text-destructive" />
                </button>
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg bg-background border border-border">
                Keyword: &quot;{search}&quot;
                <button onClick={() => { setSearch(''); setCurrentPage(1); }}>
                  <X className="w-3 h-3 hover:text-destructive" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-primary hover:underline ml-auto font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Desktop & Mobile Collapsible Filter Sidebar */}
          <aside
            className={`md:col-span-1 space-y-6 ${
              mobileFiltersOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-foreground tracking-tight">Categories</h2>
                {selectedCategory && (
                  <button
                    onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
              <ul className="space-y-1 mb-6">
                <li>
                  <button
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      !selectedCategory
                        ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                    }`}
                    onClick={() => {
                      setSelectedCategory(null)
                      setCurrentPage(1)
                      setMobileFiltersOpen(false)
                    }}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map(category => {
                  const isSelected = selectedCategory === category.id || selectedCategory === category.slug
                  return (
                    <li key={category.id}>
                      <button
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                        }`}
                        onClick={() => {
                          setSelectedCategory(category.slug || category.id)
                          setCurrentPage(1)
                          setMobileFiltersOpen(false)
                        }}
                      >
                        {category.name}
                      </button>
                    </li>
                  )
                })}
              </ul>

              {/* Price Range Filter */}
              <div className="border-t border-border/60 pt-5 mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Price Range</h3>
                <Select
                  value={priceRange}
                  onValueChange={val => {
                    setPriceRange(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full rounded-xl bg-background border-input">
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-500">Under ₹500</SelectItem>
                    <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                    <SelectItem value="1000-2000">₹1,000 - ₹2,000</SelectItem>
                    <SelectItem value="2000+">₹2,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Status Filter */}
              <div className="border-t border-border/60 pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Availability</h3>
                <Select
                  value={stockStatus}
                  onValueChange={val => {
                    setStockStatus(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full rounded-xl bg-background border-input">
                    <SelectValue placeholder="All Items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="in-stock">In Stock Only</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-3">
            {error ? (
              <div className="p-8 text-center bg-card rounded-2xl border border-destructive/20 shadow-xs max-w-md mx-auto my-12">
                <p className="text-destructive font-medium mb-4">{error}</p>
                <Button
                  onClick={() => {
                    setError(null)
                    setCurrentPage(1)
                  }}
                  className="bg-primary text-primary-foreground rounded-xl"
                >
                  Try Again
                </Button>
              </div>
            ) : loading ? (
              /* Skeleton Loader Grid - Prevents Layout Shift */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty state */
              <div className="text-center py-20 px-4 bg-card rounded-2xl border border-border/60 shadow-xs">
                <p className="text-lg font-semibold text-foreground mb-1">No products match your criteria</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Try adjusting or clearing your filters to explore our full salon catalog.
                </p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="rounded-xl border-input"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              /* Product Grid: 3 columns for balanced, aligned luxury display */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map(product => (
                  <div
                    key={product.id}
                    onMouseEnter={() => handleProductHover(product.slug)}
                    onFocus={() => handleProductHover(product.slug)}
                  >
                    <ProductCard
                      product={product}
                      showWishlist={true}
                      onWishlistToggle={handleWishlist}
                      isInWishlist={wishlist.includes(product.id)}
                      wishlistLoading={wishlistLoading === product.id}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground order-2 sm:order-1">
                  Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
                  <span className="font-semibold text-foreground">{totalPages}</span> ({total} products)
                </p>

                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-xl h-9 px-3 gap-1 border-input text-xs"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
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

                    const isActive = currentPage === pageNum
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 p-0 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                            : 'border-input hover:bg-secondary/70'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-xl h-9 px-3 gap-1 border-input text-xs"
                    aria-label="Next Page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function ProductsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-border/60 pb-6 animate-pulse">
        <div>
          <div className="h-8 bg-muted rounded-xl w-64 mb-2" />
          <div className="h-4 bg-muted/60 rounded-md w-48" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 bg-muted rounded-xl w-48" />
          <div className="h-10 bg-muted rounded-xl w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="hidden md:block md:col-span-1">
          <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-muted rounded w-24 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted/60 rounded-xl w-full" />
              ))}
            </div>
          </div>
        </aside>

        <main className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}

