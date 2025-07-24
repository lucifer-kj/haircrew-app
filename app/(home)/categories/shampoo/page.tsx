'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard, { Product } from '@/components/product-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function ShampooCategoryPageInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || '';
  const category = 'shampoo';

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      let url = `/api/products?category=${encodeURIComponent(category)}`
      if (type) url += `&type=${encodeURIComponent(type)}`
      fetch(url)
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
  }, [type])

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Shampoo Category</h1>
      {type && <div className="mb-4 text-blue-700">Type: <strong>{type}</strong></div>}
      {loading ? (
        <div className="py-12 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">No products found.</div>
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

export default function ShampooCategoryPage() {
  return (
    <Suspense>
      <ShampooCategoryPageInner />
    </Suspense>
  )
}
