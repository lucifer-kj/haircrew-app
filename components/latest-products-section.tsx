'use client'

import type { Product as ProductType } from '@/types/product'
import ProductCard from './product-card'
import { motion } from 'framer-motion'
import { useState } from 'react'

const skeletonArray = Array.from({ length: 4 })

interface LatestProductsSectionProps {
  products: ProductType[]
  loading: boolean
  onViewAll?: () => void
}

export default function LatestProductsSection({
  products,
  loading,
  onViewAll,
}: LatestProductsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(4)
  const canLoadMore = products.length > visibleCount
  const visibleProducts = products.slice(0, visibleCount)
  return (
    <section className="py-16 sm:py-20 bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-bold text-primary mb-2 block">
            Curated Formulations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Latest Products
          </h2>
          <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-2xl mx-auto">
            Check out our newest arrivals and best sellers.
          </p>
        </div>
        <div className="relative">
          {/* Grid for desktop/tablet, horizontal scroll for mobile */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? skeletonArray.map((_, i) => <ProductSkeleton key={i} />)
              : visibleProducts.map((product: ProductType) => (
                  <motion.div
                    key={product.id}
                    whileHover={{
                      scale: 1.04,
                      boxShadow: '0 8px 32px 0 rgba(153,41,234,0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ProductCard product={product} showWishlist={false} />
                  </motion.div>
                ))}
          </div>
          {/* Mobile horizontal scroll with snap */}
          <div className="sm:hidden flex gap-6 overflow-x-auto snap-x pb-2 -mx-4 px-4">
            {loading
              ? skeletonArray.map((_, i) => (
                  <motion.div
                    key={i}
                    className="min-w-[80vw] max-w-xs snap-center flex-shrink-0"
                    whileHover={{
                      scale: 1.04,
                      boxShadow: '0 8px 32px 0 rgba(153,41,234,0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ProductSkeleton />
                  </motion.div>
                ))
              : visibleProducts.map(item => (
                  <motion.div
                    key={item.id}
                    className="min-w-[80vw] max-w-xs snap-center flex-shrink-0"
                    whileHover={{
                      scale: 1.04,
                      boxShadow: '0 8px 32px 0 rgba(153,41,234,0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ProductCard product={item} showWishlist={false} />
                  </motion.div>
                ))}
          </div>
          {/* Load More Button */}
          {!loading && canLoadMore && (
            <div className="flex justify-center mt-10 gap-3">
              <button
                onClick={() => setVisibleCount(c => Math.min(c + 4, products.length))}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold shadow-xs transition text-sm cursor-pointer"
              >
                Load More
              </button>
              {onViewAll && (
                <button
                  onClick={onViewAll}
                  className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full font-semibold shadow-xs transition text-sm cursor-pointer"
                >
                  View All
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col animate-pulse overflow-hidden">
      <div className="aspect-square bg-muted/40 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-animation"></div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2 mb-4" />
        <div className="flex items-center mb-4">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-3.5 h-3.5 rounded-full bg-muted"></div>
            ))}
          </div>
          <div className="h-3 bg-muted rounded w-12 ml-auto"></div>
        </div>
        <div className="h-10 bg-primary/20 rounded-lg w-full" />
      </div>
    </div>
  )
}
