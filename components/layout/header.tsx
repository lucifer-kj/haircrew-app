'use client'

import Link from 'next/link'
import {
  X,
  ShoppingCart,
  Trash2,
  Home,
  Search as SearchIcon,
  User as UserIcon,
} from 'lucide-react'
import SearchBar from '@/components/ui/search-bar'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'
import { FocusTrap } from '@headlessui/react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

function MobileTabBar() {
  const pathname = usePathname()
  const { getCount } = useCartStore()
  const cartCount = getCount()
  const { data: session } = useSession()
  
  const tabs = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: SearchIcon, label: 'Search' },
    {
      href: '/cart',
      icon: ShoppingCart,
      label: 'Cart',
      badge: cartCount > 0 ? cartCount : null,
    },
    { 
      href: session?.user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user/profile', 
      icon: UserIcon, 
      label: session?.user?.role === 'ADMIN' ? 'Dashboard' : 'Account' 
    },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16 lg:hidden">
      {tabs.map(tab => {
        const active =
          pathname === tab.href ||
          (tab.href === '/' && pathname === '/home') ||
          ((tab.href === '/dashboard/admin' || tab.href === '/dashboard/user/profile') &&
            pathname.startsWith('/dashboard'))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1"
            aria-label={tab.label}
          >
            <motion.div
              className="flex flex-col items-center justify-center h-full text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition"
              initial={false}
              animate={
                active
                  ? { scale: 1.1, color: '#9929EA' }
                  : { scale: 1, color: '#6B7280' }
              }
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className="relative">
                <tab.icon className="w-6 h-6 mb-1" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              {tab.label}
            </motion.div>
          </Link>
        )
      })}
    </nav>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { items, removeItem, updateQuantity, getTotal, getCount } =
    useCartStore()
  const cartCount = getCount()
  const router = useRouter()
  const reduced = useFramerReducedMotion()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { data: session } = useSession()
  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Category nav structure
  const categories = [
    {
      name: 'Shampoo',
      slug: 'shampoo',
      sub: ['Anti-Dandruff', 'Volumizing', 'Color Protect'],
    },
    {
      name: 'Conditioners',
      slug: 'conditioners',
      sub: ['Moisturizing', 'Leave-In', 'Repair'],
    },
    {
      name: 'Treatments',
      slug: 'treatments',
      sub: ['Hair Masks', 'Serums', 'Oils'],
    },
    { name: 'Styling', slug: 'styling', sub: ['Gels', 'Sprays', 'Creams'] },
    {
      name: 'Accessories',
      slug: 'accessories',
      sub: ['Combs', 'Brushes', 'Clips'],
    },
  ]

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

  return (
    <>
      {/* Top promo bar (hidden on mobile) */}
      <div className="hidden md:block bg-gradient-to-r from-secondary to-[#B13BFF] text-white font-bold text-sm py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            🎉 Free shipping on orders over ₹250! Shop now
          </p>
        </div>
      </div>
      <motion.header
        className={`bg-white sticky top-0 z-50 transition-shadow ${scrolled ? 'shadow-lg' : 'shadow-none'}`}
        initial={false}
        animate={{
          boxShadow: scrolled
            ? '0 2px 16px 0 rgba(0,0,0,0.08)'
            : '0 0px 0px 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="container mx-auto px-4 flex items-center h-20 justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
            whileHover={reduced ? undefined : { scale: 1.03 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-black via-secondary to-secondary bg-clip-text text-transparent">
              HairCrew
            </span>
          </motion.a>

          {/* Spacer for desktop nav */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8" />

          {/* Desktop Navigation with dropdowns */}
          <nav className="hidden lg:flex items-center space-x-4 mx-8">
            <Link href="/explore" className="text-black hover:text-secondary font-medium px-3 py-2 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50">Explore</Link>
            <Link href="/categories" className="text-black hover:text-secondary font-medium px-3 py-2 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50">Category</Link>
            <Link href="/contact" className="text-black hover:text-secondary font-medium px-3 py-2 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50">Contact</Link>
            <Link href="/help" className="text-black hover:text-secondary font-medium px-3 py-2 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50">Help</Link>
            <div className="relative flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    className="relative p-2 text-gray-700 hover:text-secondary transition-colors hidden md:flex"
                    whileHover={reduced ? undefined : { scale: 1.05 }}
                    whileTap={reduced ? undefined : { scale: 0.95 }}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span
                      className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      aria-hidden={cartCount === 0}
                      style={{ opacity: cartCount > 0 ? 1 : 0 }}
                    >
                      {cartCount > 0 ? cartCount : ''}
                    </span>
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Shopping Cart</h3>
                    {items.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Your cart is empty
                      </p>
                    ) : (
                      <>
                        <div className="max-h-64 overflow-y-auto space-y-3">
                          {items.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-3"
                            >
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ₹{item.price}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      Math.max(0, item.quantity - 1)
                                    )
                                  }
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="text-sm w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">Total:</span>
                            <span className="font-semibold">₹{getTotal()}</span>
                          </div>
                          <div className="space-y-2">
                            <Button
                              onClick={() => router.push('/cart')}
                              className="w-full bg-secondary hover:bg-secondary/90"
                            >
                              View Cart
                            </Button>
                            <Button
                              onClick={() => router.push('/checkout')}
                              className="w-full bg-black hover:bg-gray-800"
                            >
                              Checkout
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* User/Account Dropdown */}
            {session ? (
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    whileHover={reduced ? undefined : { scale: 1.05 }}
                    whileTap={reduced ? undefined : { scale: 0.95 }}
                  >
                    <UserIcon className="w-6 h-6 text-gray-700" />
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-0">
                  <ul className="py-2">
                    <li>
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-secondary/10 hover:text-secondary rounded transition-colors"
                      >
                        Profile
                      </Link>
                    </li>
                    {session?.user?.role === 'ADMIN' && (
                      <li>
                        <Link
                          href="/dashboard/admin"
                          className="block px-4 py-2 text-gray-700 hover:bg-secondary/10 hover:text-secondary rounded transition-colors"
                        >
                          Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </PopoverContent>
              </Popover>
            ) : (
              <Button onClick={() => router.push('/auth/signin')}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-xl z-50 overflow-y-auto"
            >
              <FocusTrap>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="font-bold text-lg">Menu</span>
                    <button
                      onClick={() => setMobileNavOpen(false)}
                      className="p-2 text-gray-500 hover:text-secondary rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Mobile Search */}
                    <div className="p-4 border-b">
                      <SearchBar />
                    </div>

                    {/* Mobile Categories */}
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Categories
                      </h3>
                      {categories.map(cat => (
                        <details key={cat.slug} className="group mb-2">
                          <summary className="flex items-center justify-between cursor-pointer py-2 font-medium">
                            {cat.name}
                            <svg
                              className="w-4 h-4 transition-transform group-open:rotate-180"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </summary>
                          <div className="pl-4 mt-1 space-y-1">
                            {cat.sub.map(sub => (
                              <Link
                                key={sub}
                                href={`/categories/${cat.slug}?type=${encodeURIComponent(sub)}`}
                                className="block py-1.5 text-gray-600 hover:text-secondary transition-colors"
                                onClick={() => setMobileNavOpen(false)}
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>

                    {/* Footer Links - Moved from footer */}
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Information
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/explore"
                          className="py-1.5 text-gray-600 hover:text-secondary transition-colors"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          Explore
                        </Link>
                        <Link
                          href="/categories"
                          className="py-1.5 text-gray-600 hover:text-secondary transition-colors"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          Category
                        </Link>
                        <Link
                          href="/contact"
                          className="py-1.5 text-gray-600 hover:text-secondary transition-colors"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          Contact
                        </Link>
                        <Link
                          href="/help"
                          className="py-1.5 text-gray-600 hover:text-secondary transition-colors"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          Help
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mobile User Actions */}
                  <div className="p-4 border-t mt-auto">
                    <div className="space-y-2">
                      <Link
                        href={session?.user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user/profile'}
                        className="block w-full text-center py-3 rounded bg-secondary text-white font-bold hover:bg-secondary/90 transition"
                        onClick={() => setMobileNavOpen(false)}
                      >
                        {session?.user?.role === 'ADMIN' ? 'Admin Dashboard' : 'My Account'}
                      </Link>
                      <button
                        className="block w-full text-center py-3 rounded bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
                        onClick={() => setMobileNavOpen(false)}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </FocusTrap>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Mobile Bottom Tab Bar */}
        <MobileTabBar />
      </motion.header>
    </>
  )
}
