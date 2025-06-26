"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Heart, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cart-store"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
  categoryId: string
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
  wishlistLoading = false
}: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/Images/p1.jpg",
      slug: product.slug,
      stock: 100, // Default stock value
    }, 1)
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

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* Wishlist Button */}
      {showWishlist && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </Button>
      )}

      {/* Clickable Image and Title */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <Image 
            src={product.images[0] || "/Images/p1.jpg"} 
            alt={product.name} 
            width={300} 
            height={200} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Product Name - Clickable */}
        <Link href={`/products/${product.slug}`}>
          <CardTitle className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
            {product.name}
          </CardTitle>
        </Link>

        {/* Price */}
        <div className="text-[var(--primary)] font-bold text-xl mb-4">
          {formatPrice(product.price)}
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary-secondary)] text-white font-semibold py-2"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
} 