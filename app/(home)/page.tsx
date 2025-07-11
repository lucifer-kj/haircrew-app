import { Suspense } from "react";
import { Metadata } from "next";
import { createViewport } from "../shared-metadata";
import LatestProductsSection from "@/components/latest-products-section";
import NewsletterSection from "@/components/newsletter-section";
import AutoCarousel from "@/components/auto-carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Export viewport configuration
export const viewport = createViewport();

export const metadata: Metadata = {
  title: "HairCrew - Professional Hair Care Products",
  description: "Your trusted partner for professional hair care products. Quality, innovation, and beauty in every bottle.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Transform Your Hair Journey
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl">
                Discover professional-grade hair care products for salon-quality results at home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/categories">Browse Categories</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl">
              <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded-xl" />}>
                <AutoCarousel 
                  images={[
                    { src: "/Images/banner1.jpg", alt: "Premium hair care products" },
                    { src: "/Images/banner2.jpg", alt: "Salon-quality results" },
                    { src: "/Images/banner3.jpg", alt: "For all hair types" }
                  ]}
                  showControls={true}
                  showIndicators={true}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/products?category=shampoo" className="group">
              <div className="relative h-64 rounded-xl overflow-hidden transition-transform group-hover:scale-105">
                <Image 
                  src="/Images/c-shampoo.jpg" 
                  alt="Shampoo" 
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Shampoo</h3>
                  <p className="text-white/80 text-sm">Cleanse and refresh your hair</p>
                </div>
              </div>
            </Link>
            <Link href="/products?category=conditioner" className="group">
              <div className="relative h-64 rounded-xl overflow-hidden transition-transform group-hover:scale-105">
                <Image 
                  src="/Images/c-conditioner.jpg" 
                  alt="Conditioner" 
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Conditioner</h3>
                  <p className="text-white/80 text-sm">Nourish and hydrate your locks</p>
                </div>
              </div>
            </Link>
            <Link href="/products?category=treatment" className="group">
              <div className="relative h-64 rounded-xl overflow-hidden transition-transform group-hover:scale-105">
                <Image 
                  src="/Images/c-treatment.jpg" 
                  alt="Treatments" 
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Treatments</h3>
                  <p className="text-white/80 text-sm">Repair and strengthen your hair</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Products</h2>
          <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded-xl" />}>
            <LatestProductsSection />
          </Suspense>
          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
} 