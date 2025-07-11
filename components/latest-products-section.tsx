"use client";

import { Product } from "@/types/product";
import ProductCard from "./product-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface LatestProductsSectionProps {
  products: Product[];
  loading?: boolean;
  onViewAll?: () => void;
}

const skeletonArray = Array.from({ length: 4 });

export default function LatestProductsSection({ products, loading = false }: LatestProductsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const showViewAll = !showAll && !loading && products.length > 4;
  // Only show first 4 products unless showAll is true
  const visibleProducts = showAll ? products : products.slice(0, 4);
  return (
    <section className="py-16 bg-[#EAE4D5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#000] mb-4">Latest Products</h2>
          <p className="text-[#9929EA] font-bold max-w-2xl mx-auto">Check out our newest arrivals and best sellers.</p>
        </div>
        <div className="relative">
          {/* Grid for desktop/tablet, horizontal scroll for mobile */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? skeletonArray.map((_, i) => <ProductSkeleton key={i} />)
              : visibleProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(153,41,234,0.12)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ProductCard product={product} showWishlist={false} />
                  </motion.div>
                ))}
          </div>
          {/* Mobile horizontal scroll with snap */}
          <div className="sm:hidden flex gap-6 overflow-x-auto snap-x pb-2 -mx-4 px-4">
            {(loading ? skeletonArray : visibleProducts).map((item, i) => (
              <motion.div
                key={loading ? i : (item as Product).id}
                className="min-w-[80vw] max-w-xs snap-center flex-shrink-0"
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(153,41,234,0.12)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {loading ? (
                  <ProductSkeleton />
                ) : (
                  <ProductCard product={item as Product} showWishlist={false} />
                )}
              </motion.div>
            ))}
          </div>
          {/* View All Button */}
          {showViewAll && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 bg-[#9929EA] hover:bg-[#9929EA]/90 text-white rounded-full font-semibold shadow transition"
              >
                View All
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
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
  );
} 