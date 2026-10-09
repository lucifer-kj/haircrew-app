'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { fadeInUp } from '@/lib/motion.config'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useScrollReveal } from '@/lib/useScrollReveal'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export interface Product {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
  categoryId: string
  stock?: number
  rating?: number // 0-5
}

interface ProductCardProps {
  product: Product
  showWishlist?: boolean
  onWishlistToggle?: (productId: string) => void
  isInWishlist?: boolean
  wishlistLoading?: boolean
}

export default function ProductCard({
  product,
  showWishlist = true,
  onWishlistToggle,
  isInWishlist = false,
  wishlistLoading = false,
}: ProductCardProps) {
  const addToCart = useCartStore(state => state.addItem)
  const [cartLoading, setCartLoading] = useState(false)
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setCartLoading(true)
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/Images/p1.jpg',
        slug: product.slug,
        stock: product.stock ?? 100,
      },
      1
    )
    setTimeout(() => setCartLoading(false), 800) // Simulate async
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onWishlistToggle) {
      onWishlistToggle(product.id)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price)
  }

  // Accessibility: alt text fallback
  const imageAlt = product.name
    ? `${product.name} product image`
    : 'Product image'

  // Stock status
  const inStock = (product.stock ?? 1) > 0

  // Rating stars
  const renderStars = (rating: number = 0) => {
    return (
      <div
        className="flex items-center gap-0.5"
        aria-label={`Rated ${rating} out of 5`}
      >
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            fill={i <= Math.round(rating) ? '#facc15' : 'none'}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={reduced ? undefined : fadeInUp}
      whileHover={
        reduced
          ? undefined
          : { scale: 1.01, boxShadow: '0 8px 32px 0 rgba(153,41,234,0.10)' }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="h-full"
    >
      <Card className="group bg-card border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col h-full">
        {/* Wishlist Button */}
        {showWishlist && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
            }
            className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-md hover:bg-background border border-border/60 shadow-xs focus:ring-2 focus:ring-primary rounded-full h-8 w-8"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            tabIndex={0}
          >
            {wishlistLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Heart
                className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
              />
            )}
          </Button>
        )}

        {/* Clickable Image and Title */}
        <Link
          href={`/products/${product.slug}`}
          className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-t-2xl"
        >
          <div className="relative w-full aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
            <Image
              src={product.images[0] || '/Images/p1.jpg'}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              priority={false}
              loading="lazy"
            />
          </div>
        </Link>

        <CardContent className="flex flex-col flex-1 justify-between p-4 min-h-[140px]">
          {/* Product Name - Clickable */}
          <Link
            href={`/products/${product.slug}`}
            tabIndex={0}
            className="block focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            <CardTitle className="text-sm sm:text-base font-semibold mb-1 text-foreground group-hover:text-primary transition-colors line-clamp-2 text-left">
              <span title={product.name}>{product.name}</span>
            </CardTitle>
          </Link>

          {/* Rating and Stock */}
          <div className="flex items-center justify-between mb-2">
            {renderStars(product.rating)}
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
            >
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div className="text-primary font-bold text-lg mb-3 text-left">
            {formatPrice(product.price)}
          </div>

          {/* Add to Cart Button */}
          <div className="w-full mt-auto">
            <Button
              onClick={handleAddToCart}
              className="w-full font-semibold shadow-xs"
              disabled={!inStock || cartLoading}
              aria-disabled={!inStock || cartLoading}
              aria-label={inStock ? 'Add to cart' : 'Out of stock'}
              tabIndex={0}
            >
              {cartLoading ? (
                <LoadingSpinner size="sm" className="mr-2 text-white" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              {inStock
                ? cartLoading
                  ? 'Adding...'
                  : 'Add to Cart'
                : 'Out of Stock'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border/70 rounded-2xl overflow-hidden flex flex-col h-full animate-pulse shadow-xs">
      <div className="w-full aspect-square bg-muted/60" />
      <div className="flex flex-col flex-1 p-4 space-y-3">
        <div className="h-4 bg-muted/70 rounded-md w-3/4" />
        <div className="h-3 bg-muted/50 rounded-md w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-3 bg-muted/40 rounded w-20" />
          <div className="h-4 bg-muted/50 rounded-full w-16" />
        </div>
        <div className="h-6 bg-muted/70 rounded-md w-24" />
        <div className="h-10 bg-muted/60 rounded-xl w-full mt-auto" />
      </div>
    </div>
  )
}
