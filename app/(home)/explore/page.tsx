export const dynamic = 'force-dynamic'
export const revalidate = 300

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Droplets, 
  Zap, 
  Flame, 
  HeartHandshake, 
  Truck, 
  Award,
  ChevronRight
} from 'lucide-react'
import ProductCard from '@/components/product-card'

const concerns = [
  {
    title: 'Intensive Damage Repair',
    description: 'Restore broken bonds and seal split ends with clinical keratin treatments.',
    icon: Zap,
    href: '/products?category=treatment',
    tag: 'Critical Care',
    accent: 'from-amber-500/10 to-purple-500/10 border-amber-500/20',
  },
  {
    title: 'Frizz Defense & Smoothing',
    description: 'Weightless micro-serums creating a 72-hour moisture and humidity shield.',
    icon: Droplets,
    href: '/products?category=serum-1755943467003',
    tag: 'Anti-Humidity',
    accent: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20',
  },
  {
    title: 'Deep Fiber Hydration',
    description: 'Nutrient-dense masks delivering deep hydration without weighing hair down.',
    icon: Flame,
    href: '/products?category=mask-1755942963420',
    tag: 'Deep Moisture',
    accent: 'from-rose-500/10 to-purple-500/10 border-rose-500/20',
  },
  {
    title: 'Scalp & Root Detox',
    description: 'Purify hair follicles and balance sebum with restorative salon spa treatments.',
    icon: ShieldCheck,
    href: '/products?category=spa-1755943477185',
    tag: 'Scalp Health',
    accent: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
  },
]

export default async function ExplorePage() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        slug: true,
        categoryId: true,
        stock: true,
      },
    }),
  ])

  const formattedFeaturedProducts = featuredProducts.map(p => ({
    ...p,
    price: Number(p.price),
  }))

  return (
    <div className="min-h-screen">
      {/* Hero Showcase */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24 border-b border-border/50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Discover Haircare Excellence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-6">
            Engineered for Hair Transformation
          </h1>
          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore salon-tested formulas designed to repair damage, lock in hydration, and reveal luminous, healthy hair.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base"
            >
              Explore All Formulations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-semibold hover:bg-secondary/70 transition-all shadow-xs text-sm sm:text-base"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Hair Concerns Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Targeted Solutions</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Shop by Hair Concern
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mt-2 md:mt-0">
              Address your specific hair needs with clinically backed active ingredients and salon-grade formulas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {concerns.map((concern, idx) => {
              const Icon = concern.icon
              return (
                <Link
                  key={idx}
                  href={concern.href}
                  className="group relative p-6 rounded-3xl bg-card border border-border/70 hover:border-primary/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-semibold py-0.5 px-2 rounded-full">
                        {concern.tag}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {concern.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {concern.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>View Formulations</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Category Pills Quick Showcase */}
      <section className="py-12 bg-muted/20 border-y border-border/60">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2">
              Explore Our Spectrum
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a specialized category to start your haircare journey.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group p-4 bg-card rounded-2xl border border-border/70 hover:border-primary/60 text-center shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-muted/60 border border-border/40">
                  <Image
                    src={category.image || '/Images/p1.jpg'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {category.name}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {category._count.products} products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bestsellers */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Salon Favorites</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Featured Formulations
                </h2>
              </div>
              <Link
                href="/products"
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {formattedFeaturedProducts.map(product => (
                <div key={product.id}>
                  <ProductCard product={product} showWishlist={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value Pillars */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">100% Salon Certified</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every product is formulated and tested alongside master stylists across India for salon performance.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Pan-India Express Dispatch</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Direct dispatch with live tracking to Mumbai, Delhi, Bengaluru, Hyderabad, and across India.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Cruelty-Free & Pure</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ethically crafted formulations free of harsh parabens, sulfates, and unrefined heavy residues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}