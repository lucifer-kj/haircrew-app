'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react'
import ReviewForm from '@/components/review-form'
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
import { ErrorBoundary } from '@/components/ui/error-boundary'
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

type PageProps = {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: PageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewSortBy, setReviewSortBy] = useState<
    'newest' | 'oldest' | 'highest' | 'lowest'
  >('newest')
  const addToCart = useCartStore(state => state.addItem)
  const { data: session } = useSession()
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const { slug } = await params
      setLoading(true)
      setError(null)

      try {
        const [productRes, reviewsRes, relatedRes, authRes] = await Promise.all(
          [
            fetch(`/api/products/${slug}`),
            fetch(`/api/products/${slug}/reviews`),
            fetch(`/api/products/${slug}/related`),
            fetch('/api/auth/session'),
          ]
        )

        if (productRes.ok) {
          const productData = await productRes.json()
          setProduct(productData)
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          setReviews(Array.isArray(reviewsData) ? reviewsData : [])
        } else {
          setReviews([])
        }

        if (relatedRes.ok) {
          const relatedData = await relatedRes.json()
          setRelatedProducts(Array.isArray(relatedData) ? relatedData : [])
        } else {
          setRelatedProducts([])
        }

        if (authRes.ok) {
          const sessionData = await authRes.json()
          setIsAuthenticated(!!sessionData.user)
        }
      } catch (err) {
        console.error('Error in ProductPage:', err)
        setError('Error fetching product data.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params])

  // Check if product is in wishlist on load
  useEffect(() => {
    if (product && session?.user) {
      fetch('/api/user/wishlist', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setInWishlist(
            data.some((item: { id: string }) => item.id === product.id)
          )
        })
    }
  }, [product, session])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/Images/p1.jpg',
        slug: product.slug,
        stock: product.stock,
      },
      quantity
    )
    toast.success('Added to cart')
  }

  const handleReviewSubmit = async (reviewData: {
    rating: number
    title: string
    comment: string
  }) => {
    if (!product) return

    setIsSubmittingReview(true)
    try {
      const response = await fetch(`/api/products/${product.slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (response.ok) {
        const newReview = await response.json()
        setReviews(prev => [newReview, ...prev])
        toast.success('Review submitted successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'destructive' }
    if (stock <= 5) return { status: 'Low Stock', color: 'secondary' }
    return { status: 'In Stock', color: 'default' }
  }

  // Use safe array methods
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0

  // Calculate rating distribution
  const ratingDistribution = (reviews || []).reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1
      return acc
    },
    {} as Record<number, number>
  )

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
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

  const handleWishlist = async () => {
    if (!session?.user || !product) return
    setWishlistLoading(true)
    try {
      if (inWishlist) {
        const response = await fetch('/api/user/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
          credentials: 'include',
        })
        if (response.ok) {
          setInWishlist(false)
          toast.success('Removed from wishlist')
        } else {
          toast.error('Failed to remove from wishlist')
        }
      } else {
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
          credentials: 'include',
        })
        if (response.ok) {
          setInWishlist(true)
          toast.success('Added to wishlist')
        } else {
          toast.error('Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast.error('Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price)
  }

  if (loading)
    return (
      <div className="py-12 text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading product...</p>
      </div>
    )
  if (error)
    return (
      <div className="py-12 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    )

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Product not found</div>
      </div>
    )
  }

  const stockInfo = getStockStatus(product.stock)

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-[var(--primary)]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-[var(--primary)]">
                Products
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-[var(--primary)]"
              >
                {product.category.name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-[var(--charcoal)]">{product.name}</li>
          </ol>
        </nav>

        {/* Wishlist Button */}
        <div className="flex justify-end mb-2">
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
                className={`w-6 h-6 ${inWishlist ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-gray-400'}`}
              />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage] || '/Images/p1.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? 'border-[var(--primary)]'
                        : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={averageRating} size="md" showValue={true} />
                <Badge
                  variant={
                    stockInfo.color as 'default' | 'secondary' | 'destructive'
                  }
                >
                  {stockInfo.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-[var(--primary)]">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice &&
                  product.comparePrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
              </div>
              {product.comparePrice && product.comparePrice > product.price && (
                <Badge variant="secondary" className="w-fit">
                  {Math.round(
                    ((product.comparePrice - product.price) /
                      product.comparePrice) *
                      100
                  )}
                  % OFF
                </Badge>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1 bg-transparent hover:bg-gray-100 rounded"
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <Button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1 bg-transparent hover:bg-gray-100 rounded"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-secondary)] text-white text-lg py-3"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-lg py-3">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-lg py-3">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-2">
                    {averageRating.toFixed(1)}
                  </span>
                  <StarRating rating={averageRating} size="md" />
                  <span className="ml-2 text-sm text-gray-600">
                    ({reviews.length} reviews)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Review Statistics */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Rating Distribution */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Rating Distribution</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = ratingDistribution[rating] || 0
                    const percentage =
                      reviews.length > 0 ? (count / reviews.length) * 100 : 0
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Review Form for Authenticated Users */}
              {isAuthenticated && (
                <div>
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    isSubmitting={isSubmittingReview}
                  />
                </div>
              )}
            </div>
          )}

          {/* Review Form for Authenticated Users (when no reviews) */}
          {isAuthenticated && reviews.length === 0 && (
            <div className="mb-8">
              <ReviewForm
                onSubmit={handleReviewSubmit}
                isSubmitting={isSubmittingReview}
              />
            </div>
          )}

          {/* Review Sorting */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">All Reviews</h3>
              <select
                value={reviewSortBy}
                onChange={e =>
                  setReviewSortBy(
                    e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest'
                  )
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
                {isAuthenticated
                  ? 'No reviews yet. Be the first to review this product!'
                  : 'No reviews yet. Sign in to be the first to review this product!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedReviews.map(review => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {review.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {review.user.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <StarRating
                              rating={review.rating}
                              size="sm"
                              showValue={true}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {relatedProducts.map(relatedProduct => (
                  <CarouselItem
                    key={relatedProduct.id}
                    className="basis-80 max-w-xs"
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="flex flex-col items-center">
                        <Link href={`/products/${relatedProduct.slug}`}>
                          <Image
                            src={relatedProduct.images[0] || '/Images/p1.jpg'}
                            alt={relatedProduct.name}
                            width={300}
                            height={200}
                            className="rounded-md object-cover mb-4"
                          />
                        </Link>
                        <CardTitle className="text-lg font-semibold mb-2 text-center">
                          {relatedProduct.name}
                        </CardTitle>
                        <div className="text-[var(--primary)] font-bold text-xl mb-2">
                          {formatPrice(relatedProduct.price)}
                        </div>
                        <Link
                          href={`/products/${relatedProduct.slug}`}
                          className="text-[var(--primary)] underline mt-2"
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
      </div>
    </ErrorBoundary>
  )
}
