import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[var(--hero-gradient)] min-h-[600px] flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--charcoal)] leading-tight">
                Professional
                <span className="text-[var(--primary)] block">Hair Care</span>
                Products
              </h1>
              <p className="text-lg text-[var(--dark-gray)] max-w-md">
                Discover our premium collection of hair care products designed for professionals. 
                Quality ingredients, proven results, and salon-worthy performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-[var(--primary)] hover:bg-[var(--primary-secondary)] text-white">
                    Shop Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline" size="lg" className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/Images/banner1.jpg"
                alt="Professional hair care products"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--charcoal)]">Free Shipping</h3>
              <p className="text-[var(--dark-gray)]">Free shipping on orders over $50</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--charcoal)]">Premium Quality</h3>
              <p className="text-[var(--dark-gray)]">Professional-grade products</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--charcoal)]">30-Day Returns</h3>
              <p className="text-[var(--dark-gray)]">Hassle-free returns and exchanges</p>
            </div>
          </div>
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