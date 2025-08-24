'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react'
import StarRating from '@/components/star-rating'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import { useCartStore } from '@/store/cart-store'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  slug: string
  stock: number
  categoryId: string
  category: {
    name: string
    slug: string
  }
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  user: {
    name: string
  }
}

interface RelatedProduct {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
}

interface ProductClientProps {
  product: Product
  reviews: Review[]
  relatedProducts: RelatedProduct[]
  showReviewsOnly?: boolean
}

// Review form component
function ReviewFormClient() {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!review.trim() || !title.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Replace with actual API call
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          comment: review,
          rating,
        }),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setReview("");
        setTitle("");
        setRating(5);
        // Optionally refresh the page or update reviews state
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleReviewSubmit}
      className="mt-4 space-y-4 max-w-md p-4 border rounded-lg"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded p-2 w-full"
        >
          <option value={5}>5 Stars - Excellent</option>
          <option value={4}>4 Stars - Good</option>
          <option value={3}>3 Stars - Average</option>
          <option value={2}>2 Stars - Poor</option>
          <option value={1}>1 Star - Terrible</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your review..."
          className="border rounded p-2 w-full"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Your Review</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your detailed review..."
          className="border rounded p-2 w-full"
          rows={4}
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSubmitting && <LoadingSpinner size="sm" />}
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default function ProductClient({ 
  product, 
  reviews, 
  relatedProducts, 
  showReviewsOnly = false 
}: ProductClientProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [reviewSortBy, setReviewSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  
  const addToCart = useCartStore((state) => state.addItem)
  const { data: session } = useSession()

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price)
  }


  const ratingDistribution = useMemo(() => {
    const dist: Record<number, number> = {}
    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1
    })
    return dist
  }, [reviews])

  // Sort reviews
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      switch (reviewSortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        default:
          return 0
      }
    })
  }, [reviews, reviewSortBy])

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product) return
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      stock: product.stock,
      slug: product.slug,
    }
    addToCart(cartItem)
    toast.success('Added to cart')
  }

  // Wishlist handler
  const handleWishlist = async () => {
    if (!session?.user || !product) {
      toast.error('Please sign in to add to wishlist');
      return;
    }
    
    setWishlistLoading(true)
    try {
      const method = inWishlist ? 'DELETE' : 'POST'
      const response = await fetch('/api/user/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
        credentials: 'include',
      })
      if (response.ok) {
        setInWishlist(!inWishlist)
        toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist')
      } else {
        toast.error('Failed to update wishlist')
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast.error('Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  }

  // If showReviewsOnly, only render reviews section
  if (showReviewsOnly) {
    return (
      <>
        {/* Review Statistics */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Rating Distribution */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating] || 0
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Review Form for Authenticated Users */}
            {session?.user && (
              <div>
                <h3 className="font-semibold mb-4">Write a Review</h3>
                <ReviewFormClient />
              </div>
            )}
          </div>
        )}

        {/* Review Form for Authenticated Users (when no reviews) */}
        {session?.user && reviews.length === 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Be the first to review!</h3>
            <ReviewFormClient />
          </div>
        )}

        {/* Review Sorting */}
        {reviews.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">All Reviews</h3>
            <select
              value={reviewSortBy}
              onChange={(e) =>
                setReviewSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')
              }
              className="border rounded-lg px-3 py-1 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        )}

        {/* Existing Reviews */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Star className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600">
              {session?.user
                ? 'No reviews yet. Be the first to review this product!'
                : 'No reviews yet. Sign in to be the first to review this product!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedReviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{r.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{r.user.name}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} size="sm" showValue={true} />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </>
    );
  }

  // Main interactive product components
  return (
    <>
      {/* Wishlist Button */}
      <div className="flex justify-end mb-2 -mt-8">
        <Button
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="p-2 bg-transparent hover:bg-gray-100 rounded-full"
        >
          {wishlistLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Heart
              className={`w-6 h-6 ${
                inWishlist ? 'fill-blue-600 text-blue-600' : 'text-gray-400'
              }`}
            />
          )}
        </Button>
      </div>

      {/* Interactive Image Gallery */}
      {product.images.length > 1 && (
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-600' : 'border-transparent'
                } hover:border-blue-400 transition-colors`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="font-medium">Quantity:</label>
          <div className="flex items-center border rounded-lg">
            <Button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="px-3 py-1 bg-transparent hover:bg-gray-100 rounded text-gray-700 border-0"
            >
              -
            </Button>
            <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
            <Button
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= product.stock}
              className="px-3 py-1 bg-transparent hover:bg-gray-100 rounded text-gray-700 border-0"
            >
              +
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
          <Button 
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-lg py-3"
          >
            {wishlistLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-blue-600 text-blue-600' : ''}`} />
            )}
          </Button>
          <Button 
            onClick={handleShare}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-lg py-3"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xl font-bold mb-6">You might also like</h3>
          <Carousel className="w-full">
            <CarouselContent>
              {relatedProducts.map((relatedProduct) => (
                <CarouselItem key={relatedProduct.id} className="basis-80 max-w-xs">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="flex flex-col items-center p-4">
                      <Link href={`/products/${relatedProduct.slug}`}>
                        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
                          <Image
                            src={relatedProduct.images[0] || '/Images/p1.jpg'}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                            sizes="300px"
                          />
                        </div>
                      </Link>
                      <CardTitle className="text-lg font-semibold mb-2 text-center line-clamp-2">
                        {relatedProduct.name}
                      </CardTitle>
                      <div className="text-blue-600 font-bold text-xl mb-3">
                        {formatPrice(relatedProduct.price)}
                      </div>
                      <Link
                        href={`/products/${relatedProduct.slug}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Product
                      </Link>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      )}
    </>
  )
}