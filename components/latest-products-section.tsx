'use client'

import type { Product as ProductType } from '@/types/product'
import ProductCard from './product-card'
import { motion } from 'framer-motion'

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
  return (
    <section className="py-16 bg-[#EAE4D5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#000] mb-4">
            Latest Products
          </h2>
          <p className="text-[#9929EA] font-bold max-w-2xl mx-auto">
            Check out our newest arrivals and best sellers.
          </p>
        </div>
        <div className="relative">
          {/* Grid for desktop/tablet, horizontal scroll for mobile */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? skeletonArray.map((_, i) => <ProductSkeleton key={i} />)
              : products.map((product: ProductType) => (
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
              : products.map(item => (
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
          {/* View All Button */}
          {onViewAll && !loading && products.length > 4 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={onViewAll}
                className="px-6 py-2 bg-[#9929EA] hover:bg-[#9929EA]/90 text-white rounded-full font-semibold shadow transition"
              >
                View All
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md flex flex-col animate-pulse overflow-hidden">
      <div className="aspect-[4/3] bg-[#EAE4D5] w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="h-5 bg-[#B6B09F] rounded w-3/4 mb-2" />
        <div className="h-4 bg-[#B6B09F] rounded w-1/2 mb-4" />
        <div className="h-10 bg-[#9929EA] rounded w-full" />
      </div>
    </div>
  )
}
