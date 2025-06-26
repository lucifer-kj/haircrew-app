"use client"

import Link from "next/link"
import { Search, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import CartDrawer from "@/components/cart-drawer"

// Separate component for search functionality that uses useSearchParams
function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  // Sync input with URL param
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) setSearchQuery(search)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    router.push('/products')
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="search"
        placeholder="Search products..."
        className="pl-10 pr-10 py-2 border-gray-300 focus:border-[var(--primary)] focus:ring-[var(--primary)]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
          onClick={clearSearch}
        >
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      )}
    </form>
  )
}

// Mobile search component
function MobileSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  // Sync input with URL param
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) setSearchQuery(search)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    router.push('/products')
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="search"
        placeholder="Search products..."
        className="pl-10 pr-10 py-2 border-gray-300 focus:border-[var(--primary)] focus:ring-[var(--primary)]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
          onClick={clearSearch}
        >
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      )}
    </form>
  )
}

export function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[var(--primary)] text-white py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            🎉 Free shipping on orders over $50! Shop now
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-[var(--charcoal)]">HairCrew</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <Suspense fallback={
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 pr-10 py-2 border-gray-300 focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                  disabled
                />
              </div>
            }>
              <SearchBar />
            </Suspense>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <div title="View cart" aria-label="View cart">
              <CartDrawer />
            </div>

            {/* User menu */}
            {session ? (
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-[var(--charcoal)] hover:text-[var(--primary)]"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block">{session.user?.name || session.user?.email}</span>
                </Button>
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign Out
                  </button>
                </div>
                {/* Dropdown menu would go here */}
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="text-[var(--charcoal)] hover:text-[var(--primary)]">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
                Contact
              </Link>
            </nav>
            {/* Mobile Search */}
            <div className="mt-4">
              <Suspense fallback={
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-10 pr-10 py-2 border-gray-300 focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                    disabled
                  />
                </div>
              }>
                <MobileSearchBar />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 