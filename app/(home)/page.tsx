"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useMemo, Suspense } from "react"
import { useSession } from "next-auth/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRef } from "react"
import { useCallback } from "react"
import LatestProductsSection from "@/components/latest-products-section";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useStaggeredChildren } from "@/lib/useStaggeredChildren";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { MarqueeEffectDoubleExample } from "@/components/ui/marquee-demo";
import NewsletterSection from "@/components/newsletter-section";
import { HeroSkeleton } from "@/components/ui/skeleton-loader";
import type { Product as ProductType } from "@/types/product";
import { useRouter } from "next/navigation";

// Separate component for hero carousel to optimize rendering
function HeroCarousel() {
  const heroSlides = useMemo(() => [
    {
      image: "/Images/banner1.jpg",
      headline: "Transform Your Hair Journey",
      desc: "Discover the latest collection of professional hair care products for every hair type and need."
    },
    {
      image: "/Images/banner2.jpg",
      headline: "Salon-Quality Results at Home",
      desc: "Experience professional-grade formulas trusted by stylists worldwide."
    },
    {
      image: "/Images/banner3.jpg",
      headline: "Nourish. Style. Shine.",
      desc: "Find the perfect products for your unique hair goals."
    },
  ], []);
  
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimeout = useRef<NodeJS.Timeout | null>(null);
  const reduced = useReducedMotion();
  const [heroRef, heroInView] = useScrollReveal();
  const router = useRouter();
  const { parent: featuresParent, child: featuresChild } = useStaggeredChildren();
  
  // Preload all images when component mounts
  useEffect(() => {
    heroSlides.forEach(slide => {
      if (typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = slide.image;
      }
    });
  }, [heroSlides]);
  
  // Handle carousel timer
  useEffect(() => {
    if (heroTimeout.current) clearTimeout(heroTimeout.current);
    heroTimeout.current = setTimeout(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length);
    }, 4000);
    return () => {
      if (heroTimeout.current) clearTimeout(heroTimeout.current);
    };
  }, [heroIndex, heroSlides.length]);

  // Prefetch product page for faster navigation
  useEffect(() => {
    router.prefetch('/products');
  }, [router]);

  return (
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "show" : "hidden"}
        variants={reduced ? undefined : {
          hidden: {
            opacity: 0,
            y: 20,
            transition: { duration: 0.4 }
          },
          show: {
            opacity: 1, 
            y: 0,
            transition: {
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1.0]
            }
          }
        }}
        className="relative bg-gradient-to-r from-[var(--hero-gradient)] flex items-center justify-center h-[520px]"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 grid-rows-2 gap-6 h-[440px]">
            {/* Main Hero Card as Carousel */}
            <div className="relative col-span-4 lg:col-span-2 row-span-2 bg-white rounded-2xl shadow-lg flex flex-col justify-end overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
            <AnimatePresence mode="wait">
              {heroSlides.map((slide, idx) => (
                idx === heroIndex && (
                  <motion.div
                  key={slide.image}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image 
                      src={slide.image}
                      alt={slide.headline}
                      fill
                      priority={true}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={90}
                      className="object-cover"
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0" />
                  <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                      {slide.headline}
              </h1>
                    <p className="text-base text-white/90 mb-6 max-w-md drop-shadow">
                      {slide.desc}
              </p>
                      <Link href="/products" prefetch={true}>
                  <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-full font-semibold shadow-md px-8 py-3 text-lg">
                    Shop Now
                  </Button>
                </Link>
              </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            </div>
            {/* Right Side: 2x2 Grid of Cards (hidden on mobile/tablet) */}
            <motion.div
              className="hidden lg:grid col-span-2 row-span-2 grid-cols-2 grid-rows-2 gap-6 h-full"
              initial="hidden"
              animate={heroInView ? "show" : "hidden"}
              variants={reduced ? undefined : featuresParent}
            >
              {/* Shampoo Card */}
              <motion.div variants={reduced ? undefined : featuresChild}>
              <Link href="/categories/shampoo" prefetch={true} className="h-full w-full rounded-xl shadow-md flex flex-col justify-end p-0 overflow-hidden group relative" style={{ minHeight: 0 }}>
                <Image 
                  src="/Images/c-shampoo.jpg"
                  alt="Shampoo"
                  fill
                  sizes="(max-width: 1024px) 0vw, 25vw"
                  className="object-cover transition-transform duration-300 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col justify-end h-full w-full pl-8 pb-8">
                  <h3 className="text-2xl font-extrabold font-headings text-white mb-2 text-left">Shampoo</h3>
                  <p className="text-lg font-semibold text-white text-left max-w-xs">Cleansing and nourishing formulas for all hair types.</p>
                </div>
              </Link>
              </motion.div>
              {/* Conditioners Card */}
              <motion.div variants={reduced ? undefined : featuresChild}>
              <Link href="/categories/conditioner" prefetch={true} className="h-full w-full rounded-xl shadow-md flex flex-col justify-end p-0 overflow-hidden group relative" style={{ minHeight: 0 }}>
                <Image 
                  src="/Images/c-conditioner.jpg"
                  alt="Conditioner"
                  fill
                  sizes="(max-width: 1024px) 0vw, 25vw"
                  className="object-cover transition-transform duration-300 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col justify-end h-full w-full pl-8 pb-8">
                  <h3 className="text-2xl font-extrabold font-headings text-white mb-2 text-left">Conditioners</h3>
                  <p className="text-lg font-semibold text-white text-left max-w-xs">Hydrating and smoothing conditioners for silky hair.</p>
                </div>
              </Link>
              </motion.div>
              {/* Treatments Card */}
              <motion.div variants={reduced ? undefined : featuresChild}>
              <Link href="/categories/treatment" prefetch={true} className="h-full w-full rounded-xl shadow-md flex flex-col justify-end p-0 overflow-hidden group relative" style={{ minHeight: 0 }}>
                <Image 
                  src="/Images/p4.jpg"
                  alt="Treatments"
                  fill
                  sizes="(max-width: 1024px) 0vw, 25vw"
                  className="object-cover transition-transform duration-300 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col justify-end h-full w-full pl-8 pb-8">
                  <h3 className="text-2xl font-extrabold font-headings text-white mb-2 text-left">Treatments</h3>
                  <p className="text-lg font-semibold text-white text-left max-w-xs">Repair and restore with intensive treatments.</p>
                </div>
              </Link>
              </motion.div>
              {/* Promo Card */}
              <motion.div variants={reduced ? undefined : featuresChild}>
              <Link href="/products?promo=new" prefetch={true} className="h-full w-full rounded-xl shadow-md flex flex-col justify-end p-0 overflow-hidden group relative bg-gradient-to-br from-secondary to-[#B13BFF]" style={{ minHeight: 0 }}>
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm rounded-xl" />
                <div className="relative z-10 flex flex-col justify-end h-full w-full pl-8 pb-8">
                  <h3 className="text-2xl font-extrabold font-headings text-white mb-2 text-left">New Arrivals</h3>
                  <p className="text-lg font-semibold text-white text-left max-w-xs mb-3">Explore the latest in hair care innovation.</p>
                  <Button className="bg-white text-secondary rounded-full font-bold shadow hover:bg-gray-100 w-fit px-8 py-3 text-lg">
                    Shop New
                  </Button>
                </div>
              </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>
  );
}

export default function HomePage() {
  const [latestProducts, setLatestProducts] = useState<ProductType[]>([]);
  const { data: session } = useSession();
  const [showSignInPopover, setShowSignInPopover] = useState(false);
  const [mobile, setMobile] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const router = useRouter();

  // Prefetch common navigation paths
  useEffect(() => {
    // Prefetch important routes for faster navigation
    router.prefetch('/products');
    router.prefetch('/categories');
    router.prefetch('/cart');
    router.prefetch('/dashboard/profile');
  }, [router]);

  useEffect(() => {
    if (!session) setShowSignInPopover(true);
  }, [session]);

  // Fetch latest products
  useEffect(() => {
    fetch("/api/products/latest")
      .then(res => res.json())
      .then((data) => {
        setLatestProducts(data);
        setProductsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch latest products:", err);
        setProductsLoading(false);
      });
  }, []);

  const handleViewMore = useCallback(() => {
    router.push('/products');
  }, [router]);

  return (
    <div className="min-h-screen">
      {/* Sign-In Popover */}
      <Popover open={showSignInPopover} onOpenChange={setShowSignInPopover}>
        <PopoverContent align="center" className="w-96 max-w-full p-6 rounded-xl shadow-2xl border bg-white z-50">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-1">Login or Signup</h2>
            <p className="text-gray-600 text-sm mb-2">Register now and get exclusive HairCrew rewards instantly!</p>
            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="border rounded-lg px-4 py-2 text-base focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
              maxLength={10}
            />
            <button className="bg-secondary text-white rounded-full py-2 font-semibold shadow hover:bg-secondary/90 transition" disabled={mobile.length !== 10}>Send OTP</button>
            <button className="text-xs text-gray-400 hover:text-gray-600 mt-2" onClick={() => setShowSignInPopover(false)}>Close</button>
          </div>
        </PopoverContent>
        <PopoverTrigger asChild><span /></PopoverTrigger>
      </Popover>

      {/* Hero Section - Rendered immediately with internal loading state */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroCarousel />
      </Suspense>

      {/* Marquee Section */}
      <MarqueeEffectDoubleExample />

      {/* Latest Products Section */}
      <LatestProductsSection
        products={latestProducts}
        loading={productsLoading}
        onViewAll={latestProducts.length > 3 ? handleViewMore : undefined}
      />

      {/* Featured Categories */}
      <section className="py-16 bg-[var(--light-gray)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-4">Shop by Category</h2>
            <p className="text-[var(--dark-gray)] max-w-2xl mx-auto">
              Explore our comprehensive range of hair care products organized by category
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/categories/shampoo" prefetch={true} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <Image
                    src="/Images/c-shampoo.jpg"
                    alt="Shampoo"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-2">Shampoo</h3>
                  <p className="text-[var(--dark-gray)]">Professional shampoos for all hair types</p>
                </div>
              </div>
            </Link>

            <Link href="/categories/conditioner" prefetch={true} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <Image
                    src="/Images/c-conditioner.jpg"
                    alt="Conditioner"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-2">Conditioner</h3>
                  <p className="text-[var(--dark-gray)]">Nourishing conditioners for healthy hair</p>
                </div>
              </div>
            </Link>

            <Link href="/categories/treatment" prefetch={true} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <Image
                    src="/Images/c-treatment.jpg"
                    alt="Treatment"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-2">Treatment</h3>
                  <p className="text-[var(--dark-gray)]">Specialized treatments for hair repair</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
} 