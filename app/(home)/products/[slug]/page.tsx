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

import { prisma } from '@/lib/prisma'

// Server-side data fetchers
async function getProduct(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })
    
    if (!product) {
      return null
    }
    
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
      images: product.images,
      slug: product.slug,
      stock: product.stock,
      categoryId: product.categoryId,
      category: product.category,
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

async function getReviews(slug: string): Promise<Review[]> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!product) return []

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      title: r.title || '',
      comment: r.comment || '',
      createdAt: r.createdAt.toISOString(),
      user: {
        name: r.user.name || 'Anonymous',
      },
    }))
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return []
  }
}

async function getRelatedProducts(slug: string): Promise<RelatedProduct[]> {
  try {
    const currentProduct = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    })
    if (!currentProduct) return []

    const related = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        id: { not: currentProduct.id },
        isActive: true,
      },
      take: 4,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        slug: true,
      },
    })

    return related.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      images: p.images,
      slug: p.slug,
    }))
  } catch (error) {
    console.error('Failed to fetch related products:', error)
    return []
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
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-xs"
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

  // Generate structured data for the product
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "HairCrew"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.haircrew.in/products/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "HairCrew"
      }
    },
    "category": product.category.name,
    "aggregateRating": reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": reviews.length,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "review": reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "author": {
        "@type": "Person",
        "name": review.user.name
      },
      "reviewBody": review.comment,
      "datePublished": review.createdAt
    }))
  };

  // Generate breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.haircrew.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://www.haircrew.in/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.category.name,
        "item": `https://www.haircrew.in/categories/${product.category.slug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.name,
        "item": `https://www.haircrew.in/products/${product.slug}`
      }
    ]
  };

  return (
    <ErrorBoundary>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-primary transition-colors">
                Products
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/categories`}
                className="hover:text-primary transition-colors"
              >
                {product.category?.name || 'Category'}
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery - Server-rendered */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-border shadow-xs">
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
                    className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-border/60"
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
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={averageRating} size="md" showValue={true} />
                <Badge
                  variant={
                    product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'
                  }
                  className="rounded-full px-3 py-0.5 text-xs font-semibold"
                >
                  {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {product.comparePrice && product.comparePrice > product.price && (
                <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-primary/20">
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
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
            <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-2 text-foreground">{averageRating.toFixed(1)}</span>
                  <StarRating rating={averageRating} size="md" />
                  <span className="ml-2 text-sm text-muted-foreground">({reviews.length} reviews)</span>
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
            <h2 className="text-2xl font-bold tracking-tight mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-card border border-border/60 rounded-2xl shadow-xs hover:shadow-md transition-all p-4 group">
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <div className="relative aspect-square bg-muted/40 rounded-xl overflow-hidden mb-4">
                      <Image
                        src={relatedProduct.images[0] || '/Images/p1.jpg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <h3 className="text-base font-semibold mb-1 text-center line-clamp-1 group-hover:text-primary transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="text-primary font-bold text-lg mb-3 text-center">
                      {formatPrice(relatedProduct.price)}
                    </div>
                    <div className="text-xs font-semibold text-center text-primary py-2 px-3 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
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