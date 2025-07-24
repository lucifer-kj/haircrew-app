'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ProductCard, { Product } from '@/components/product-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function SearchPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [search, setSearch] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch products when search changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!search) {
      setProducts([])
      setError(null)
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      fetch(`/api/products?search=${encodeURIComponent(search)}&page=1&pageSize=24`)
        .then(res => res.json())
        .then((data: { products: Product[] }) => {
          setProducts(Array.isArray(data.products) ? data.products : [])
        })
        .catch(() => {
          setProducts([])
          setError('Error loading products.')
        })
        .finally(() => setLoading(false))
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // Keep URL in sync with search
  useEffect(() => {
    if (search !== initialQuery) {
      const params = new URLSearchParams(window.location.search)
      if (search) {
        params.set('query', search)
      } else {
        params.delete('query')
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
    // eslint-disable-next-line
  }, [search])

  const clearSearch = () => {
    setSearch('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Optionally, trigger fetch immediately
    setSearch(search.trim())
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-center">Search</h1>
      <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-6 flex items-center gap-2">
        <Input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
            onClick={clearSearch}
          >
            {/* X icon or text */}
          </Button>
        )}
      </form>
      {search && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
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
      {loading ? (
        <div className="py-12 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              No products found.
            </div>
          ) : (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
