export const dynamic = 'force-dynamic'
export const revalidate = 300

import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, Sparkles, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
      products: {
        take: 1,
        select: {
          images: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Luxury salon fallback images mapping
  const fallbackImages: Record<string, string> = {
    shampoo: '/Images/c-shampoo.jpg',
    conditioner: '/Images/c-conditioner.jpg',
    treatment: '/Images/c-treatment.jpg',
    mask: '/Images/p1.jpg',
    serum: '/Images/p2.jpg',
    spa: '/Images/p3.jpg',
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Category Hero Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Curated Haircare Collections
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
          Explore by Category
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          From intensive scalp therapies to salon-grade styling serums, discover specialized formulations engineered for every hair texture and concern.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(category => {
          const key = category.name.toLowerCase()
          const imageUrl =
            category.image ||
            category.products[0]?.images[0] ||
            fallbackImages[key] ||
            '/Images/banner2.jpg'

          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group block"
            >
              <div className="bg-card border border-border/70 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                {/* Image Container with Luxury Gradient Overlay */}
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted/40">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-md border border-border/40 font-semibold px-3 py-1 rounded-full shadow-xs text-xs">
                      {category._count.products} Formulations
                    </Badge>
                    <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border/40 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all shadow-xs">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bottom Image Title for Visual Impact */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                      {category.name}
                    </h2>
                  </div>
                </div>

                {/* Content & Description */}
                <div className="p-6 flex flex-col flex-1 justify-between bg-card">
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {category.description ||
                        `Explore professional-grade salon ${category.name.toLowerCase()} products formulated for radiant, healthy hair.`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary/90">
                    <span>Browse Collection</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 bg-card rounded-3xl border border-border/60 shadow-xs max-w-md mx-auto">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Categories Found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            We are currently updating our salon inventory. Please check back shortly.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      )}
    </div>
  )
}
