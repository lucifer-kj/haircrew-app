import { Metadata } from "next";
import React from "react";
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import StarRating from '@/components/star-rating'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import ProductClient from './product-client'



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

// Example: generateMetadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const product = await getProduct(slug);
    return {
      title: product ? `${product.name} | Your Store` : `Product - ${slug}`,
      description: product?.description || `Details and reviews for product: ${slug}`,
      openGraph: {
        title: product?.name || `Product - ${slug}`,
        description: product?.description || `Details and reviews for product: ${slug}`,
        images: product?.images?.[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return {
      title: `Product - ${slug}`,
      description: `Details and reviews for product: ${slug}`,
    };
  }
}

// Server-side data fetchers
async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${slug}`, {
      cache: 'no-store', // or 'force-cache' for static generation
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

async function getReviews(slug: string): Promise<Review[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${slug}/reviews`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}

async function getRelatedProducts(slug: string): Promise<RelatedProduct[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${slug}/related`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}

// Format price utility
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(price)
}

// Main page component (Server Component)
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Fetch all data in parallel
  const [product, reviews, relatedProducts] = await Promise.all([
    getProduct(slug),
    getReviews(slug),
    getRelatedProducts(slug),
  ]);

  // Handle product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-gray-600 text-lg mb-4">Product not found.</div>
          <Link 
            href="/products"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length === 0 
    ? 0 
    : reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-blue-600">
                Products
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-blue-600"
              >
                {product.category.name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery - Server-rendered */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images[0] || '/Images/p1.jpg'}
                alt={product.name || 'Product Image'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Information - Server-rendered */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={averageRating} size="md" showValue={true} />
                <Badge
                  variant={
                    product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'
                  }
                >
                  {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {product.comparePrice && product.comparePrice > product.price && (
                <Badge variant="secondary" className="w-fit">
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}
                  % OFF
                </Badge>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Interactive components moved to client component */}
            <ProductClient 
              product={product}
              reviews={reviews}
              relatedProducts={relatedProducts}
            />
          </div>
        </div>

        {/* Reviews Section - Server-rendered structure */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-2">{averageRating.toFixed(1)}</span>
                  <StarRating rating={averageRating} size="md" />
                  <span className="ml-2 text-sm text-gray-600">({reviews.length} reviews)</span>
                </div>
              </div>
            )}
          </div>

          {/* Review Form and Interactive Elements handled by client component */}
          <ProductClient 
            product={product}
            reviews={reviews}
            relatedProducts={relatedProducts}
            showReviewsOnly={true}
          />
        </div>

        {/* Related Products - Server-rendered */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={relatedProduct.images[0] || '/Images/p1.jpg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-center">
                      {relatedProduct.name}
                    </h3>
                    <div className="text-blue-600 font-bold text-xl mb-2 text-center">
                      {formatPrice(relatedProduct.price)}
                    </div>
                    <div className="text-blue-600 underline mt-2 text-center hover:text-blue-800">
                      View Product
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}