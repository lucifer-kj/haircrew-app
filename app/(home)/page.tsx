"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import ProductCard from "@/components/product-card"
import AutoCarousel from "@/components/auto-carousel"
import { useSession } from "next-auth/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRef } from "react"
import { useCallback } from "react"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
  categoryId: string
}

export default function HomePage() {
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const { data: session } = useSession();
  const [showSignInPopover, setShowSignInPopover] = useState(false);
  const [mobile, setMobile] = useState("");
  // Hero carousel logic
  const heroSlides = [
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
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (heroTimeout.current) clearTimeout(heroTimeout.current);
    heroTimeout.current = setTimeout(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length);
    }, 4000);
    return () => {
      if (heroTimeout.current) clearTimeout(heroTimeout.current);
    };
  }, [heroIndex]);

  useEffect(() => {
    if (!session) setShowSignInPopover(true);
  }, [session]);

  useEffect(() => {
    fetch("/api/products/latest")
      .then(res => res.json())
      .then(setLatestProducts)
  }, [])

  const [showAllProducts, setShowAllProducts] = useState(false);
  const handleViewMore = useCallback(() => setShowAllProducts(true), []);

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
      {/* Hero Section - Bento Grid */}
      <section className="relative bg-gradient-to-r from-[var(--hero-gradient)] flex items-center justify-center h-[520px]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 grid-rows-2 gap-6 h-[440px]">
            {/* Main Hero Card as Carousel */}
            <div className="relative col-span-4 lg:col-span-2 row-span-2 bg-white rounded-2xl shadow-lg flex flex-col justify-end overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.image}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0" />
                  <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                      {slide.headline}
                    </h1>
                    <p className="text-base text-white/90 mb-6 max-w-md drop-shadow">
                      {slide.desc}
                    </p>
                    <Link href="/products">
                      <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white rounded-full font-semibold shadow-md">
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {/* Right Side: 2x2 Grid of Cards (hidden on mobile/tablet) */}
            <div className="hidden lg:grid col-span-2 row-span-2 grid-cols-2 grid-rows-2 gap-6 h-full">
              {/* Shampoo Card */}
              <Link href="/categories/shampoo" className="h-full w-full rounded-xl shadow-md flex flex-col justify-end p-0 overflow-hidden group relative" style={{ minHeight: 0 }}>
                <div className="absolute inset-0 w-full h-full rounded-xl transition-transform duration-300 scale-110 group-hover:scale-100 bg-cover bg-center" style={{ backgroundImage: 'url(/Images/c-shampoo.jpg)' }} />
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col justify-end h-full w-full pl-8 pb-8">
                  <h3 className="text-2xl font-extrabold font-headings text-white mb-2 text-left">Shampoo</h3>
                  <p className="text-lg font-semibold text-white text-left max-w-xs">Cleansing and nourishing formulas for all hair types.</p>
                </div>
              </Link>
              {/* Conditioners Card */}
              <Link href="/categories/conditioner" className="h-full w-full rounded-xl shadow-md flex flex-col justify-end p-0 overflow-hidden group relative" style={{ minHeight: 0 }}>
                <div className="absolute inset-0 w-full h-full rounded-xl transition-transform duration-300 scale-110 group-hover:scale-100 bg-cover bg-center" style={{ backgroundImage: 'url(/Images/c-conditioner.jpg)' }} />
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col justify-end h-full w-full pl-8 pb-8">
                  <h3 className="text-2xl font-extrabold font-headings text-white mb-2 text-left">Conditioners</h3>
                  <p className="text-lg font-semibold text-white text-left max-w-xs">Hydrating and smoothing conditioners for silky hair.</p>
                </div>
              </Link>
              {/* Treatments Card */}
              <Link href="/categories/treatment" className="h-full w-full rounded-xl shadow-md flex flex-col justify-end p-0 overflow-hidden group relative" style={{ minHeight: 0 }}>
                <div className="absolute inset-0 w-full h-full rounded-xl transition-transform duration-300 scale-110 group-hover:scale-100 bg-cover bg-center" style={{ backgroundImage: 'url(/Images/p4.jpg)' }} />
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col justify-end h-full w-full pl-8 pb-8">
                  <h3 className="text-2xl font-extrabold font-headings text-white mb-2 text-left">Treatments</h3>
                  <p className="text-lg font-semibold text-white text-left max-w-xs">Repair and restore with intensive treatments.</p>
                </div>
              </Link>
              {/* Promo Card */}
              <Link href="/products?promo=new" className="h-full w-full rounded-xl shadow-md flex flex-col justify-end p-0 overflow-hidden group relative bg-gradient-to-br from-secondary to-[#B13BFF]" style={{ minHeight: 0 }}>
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm rounded-xl" />
                <div className="relative z-10 flex flex-col justify-end h-full w-full pl-8 pb-8">
                  <h3 className="text-2xl font-extrabold font-headings text-white mb-2 text-left">New Arrivals</h3>
                  <p className="text-lg font-semibold text-white text-left max-w-xs mb-3">Explore the latest in hair care innovation.</p>
                  <Button size="lg" className="bg-white text-secondary rounded-full font-bold shadow hover:bg-gray-100 w-fit">Shop New</Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white hidden md:block">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--charcoal)]">Free Shipping</h3>
              <p className="text-[var(--dark-gray)]">Free shipping on orders over ₹500</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--charcoal)]">Premium Quality</h3>
              <p className="text-[var(--dark-gray)]">Professional-grade products</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--charcoal)]">30-Day Returns</h3>
              <p className="text-[var(--dark-gray)]">Hassle-free returns and exchanges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-4">Latest Products</h2>
            <p className="text-[var(--dark-gray)] max-w-2xl mx-auto">Check out our newest arrivals and best sellers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {(showAllProducts ? latestProducts : latestProducts.slice(0, 3)).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                showWishlist={false}
              />
            ))}
          </div>
          {!showAllProducts && latestProducts.length > 3 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleViewMore}
                className="px-6 py-2 bg-secondary text-white rounded-full font-semibold shadow hover:bg-secondary/90 transition"
              >
                View More
              </button>
            </div>
          )}
        </div>
      </section>

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
            <Link href="/categories/shampoo" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <Image
                    src="/Images/c-shampoo.jpg"
                    alt="Shampoo"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-2">Shampoo</h3>
                  <p className="text-[var(--dark-gray)]">Professional shampoos for all hair types</p>
                </div>
              </div>
            </Link>

            <Link href="/categories/conditioner" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <Image
                    src="/Images/c-conditioner.jpg"
                    alt="Conditioner"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-2">Conditioner</h3>
                  <p className="text-[var(--dark-gray)]">Nourishing conditioners for healthy hair</p>
                </div>
              </div>
            </Link>

            <Link href="/categories/treatment" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <Image
                    src="/Images/c-treatment.jpg"
                    alt="Treatment"
                    fill
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

      {/* CTA Section */}
      <section className="py-16 bg-[var(--primary)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hair?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust HairCrew for their hair care needs. 
            Start your journey to beautiful, healthy hair today.
          </p>
          <Link href="/products">
            <Button size="lg" variant="secondary" className="bg-white text-[var(--primary)] hover:bg-gray-100">
              Explore Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
} 