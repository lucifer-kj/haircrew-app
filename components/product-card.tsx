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
      <Card className="group bg-white rounded-xl shadow-md transition-all duration-300 relative overflow-hidden flex flex-col h-full">
        {/* Wishlist Button */}
        {showWishlist && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
            }
            className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm hover:bg-white focus:ring-2 focus:ring-secondary"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            tabIndex={0}
          >
            {wishlistLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Heart
                className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            )}
          </Button>
        )}

        {/* Clickable Image and Title */}
        <Link
          href={`/products/${product.slug}`}
          className="block focus:outline-none focus:ring-2 focus:ring-secondary rounded-t-xl"
        >
          <div className="relative w-full aspect-[4/3] bg-[#EAE4D5] overflow-hidden flex items-center justify-center">
            <Image
              src={product.images[0] || '/Images/p1.jpg'}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
          </div>
        </Link>

        <CardContent className="flex flex-col flex-1 justify-between p-4 min-h-[140px]">
          {/* Product Name - Clickable */}
          <Link
            href={`/products/${product.slug}`}
            tabIndex={0}
            className="block focus:outline-none focus:ring-2 focus:ring-secondary rounded"
          >
            <CardTitle className="text-base sm:text-lg font-bold mb-1 text-gray-900 group-hover:text-secondary transition-colors line-clamp-2 text-left">
              <span title={product.name}>{product.name}</span>
            </CardTitle>
          </Link>

          {/* Rating and Stock */}
          <div className="flex items-center justify-between mb-1">
            {renderStars(product.rating)}
            <span
              className={`text-xs font-semibold ml-2 ${inStock ? 'text-green-600' : 'text-red-500'}`}
            >
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div className="text-secondary font-bold text-lg mb-2 text-left">
            {formatPrice(product.price)}
          </div>

          {/* Add to Cart Button */}
          <div className="w-full mt-auto">
            <Button
              onClick={handleAddToCart}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-2 transition-all duration-200 flex items-center justify-center"
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
