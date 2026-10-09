'use client'

import Link from 'next/link'
import {
  X,
  Menu,
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
import { Logo } from '@/components/ui/logo'

function MobileTabBar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { getCount } = useCartStore()
  const cartCount = getCount()
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayCount = mounted ? cartCount : 0
  
  const tabs = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: SearchIcon, label: 'Search' },
    {
      href: '/cart',
      icon: ShoppingCart,
      label: 'Cart',
      badge: displayCount > 0 ? displayCount : null,
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
              className="flex flex-col items-center justify-center h-full text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
              initial={false}
              animate={
                active
                  ? { scale: 1.08, color: '#8b15e8' }
                  : { scale: 1, color: '#6B7280' }
              }
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className="relative">
                <tab.icon className="w-6 h-6 mb-1" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-xs">
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
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, getTotal, getCount } =
    useCartStore()
  const cartCount = getCount()
  const router = useRouter()
  const reduced = useFramerReducedMotion()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
    const handleScroll = (): void => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Do not render consumer store header on admin routes
  if (pathname?.startsWith('/dashboard/admin') || pathname?.startsWith('/admin')) {
    return null
  }

  const displayCartCount = mounted ? cartCount : 0

  return (
    <>
      {/* Top promo bar */}
      <div className="bg-gradient-to-r from-primary-dark via-primary to-purple-800 text-white font-medium text-xs sm:text-sm py-2 shadow-xs">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <p className="text-center tracking-wide">
            ✨ Free express shipping on all orders over ₹250! <Link href="/products" className="underline font-semibold ml-1 hover:text-white/80 transition-colors">Shop Now</Link>
          </p>
        </div>
      </div>
      <motion.header
        className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all border-b border-border/60 ${scrolled ? 'shadow-md' : 'shadow-none'}`}
        initial={false}
        animate={{
          boxShadow: scrolled
            ? '0 4px 20px -2px rgba(139, 21, 232, 0.08)'
            : '0 0px 0px 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="container mx-auto px-4 flex items-center h-20 justify-between">
          {/* Logo */}
          <Logo size="default" />

          {/* Spacer for desktop nav */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-6" />

          {/* Desktop Navigation with dropdowns */}
          <nav className="hidden lg:flex items-center space-x-2 mx-6">
            <Link href="/explore" className="text-foreground/90 hover:text-primary hover:bg-secondary/60 font-medium px-3.5 py-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">Explore</Link>
            <Link href="/categories" className="text-foreground/90 hover:text-primary hover:bg-secondary/60 font-medium px-3.5 py-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">Category</Link>
            <Link href="/delhi" className="text-foreground/90 hover:text-primary hover:bg-secondary/60 font-medium px-3.5 py-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">Delhi</Link>
            <Link href="/contact" className="text-foreground/90 hover:text-primary hover:bg-secondary/60 font-medium px-3.5 py-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">Contact</Link>
            <Link href="/help" className="text-foreground/90 hover:text-primary hover:bg-secondary/60 font-medium px-3.5 py-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">Help</Link>
            <div className="relative flex items-center ml-2">
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    className="relative p-2 text-foreground/80 hover:text-primary hover:bg-secondary/60 rounded-xl transition-colors hidden md:flex"
                    whileHover={reduced ? undefined : { scale: 1.05 }}
                    whileTap={reduced ? undefined : { scale: 0.95 }}
                    aria-label="View Shopping Cart"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span
                      className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-xs transition-opacity duration-200"
                      aria-hidden={displayCartCount === 0}
                      style={{ opacity: displayCartCount > 0 ? 1 : 0 }}
                    >
                      {displayCartCount > 0 ? displayCartCount : ''}
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
                              variant="outline"
                              className="w-full rounded-xl"
                            >
                              View Cart
                            </Button>
                            <Button
                              onClick={() => router.push('/checkout')}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-xs"
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
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* User/Account Dropdown */}
            {session ? (
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    className="p-2 rounded-full border border-border bg-card hover:bg-secondary text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    whileHover={reduced ? undefined : { scale: 1.05 }}
                    whileTap={reduced ? undefined : { scale: 0.95 }}
                    aria-label="User account"
                  >
                    <UserIcon className="w-5 h-5" />
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-52 p-1.5 shadow-lg border border-border/80 rounded-xl">
                  <div className="px-3 py-2 border-b border-border/60 mb-1">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-foreground">{session.user?.name || session.user?.email}</p>
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/dashboard/user/profile"
                        className="block px-3 py-1.5 text-sm text-foreground/80 hover:bg-secondary hover:text-primary rounded-lg transition-colors font-medium"
                      >
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/user/orders"
                        className="block px-3 py-1.5 text-sm text-foreground/80 hover:bg-secondary hover:text-primary rounded-lg transition-colors font-medium"
                      >
                        My Orders
                      </Link>
                    </li>
                    {session?.user?.role === 'ADMIN' && (
                      <li>
                        <Link
                          href="/dashboard/admin"
                          className="block px-3 py-1.5 text-sm text-primary font-semibold hover:bg-secondary rounded-lg transition-colors"
                        >
                          🛡️ Admin Dashboard
                        </Link>
                      </li>
                    )}
                    <li className="pt-1 border-t border-border/60">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </PopoverContent>
              </Popover>
            ) : (
              <Button size="sm" onClick={() => router.push('/auth/signin')}>
                Sign In
              </Button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-foreground hover:text-primary hover:bg-secondary transition-colors"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
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
                  <div className="p-4 border-t border-border mt-auto">
                    {session ? (
                      <div className="space-y-2">
                        <Link
                          href={session?.user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user/profile'}
                          className="block w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition text-sm"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          {session?.user?.role === 'ADMIN' ? '🛡️ Admin Dashboard' : 'My Account'}
                        </Link>
                        <button
                          onClick={() => {
                            setMobileNavOpen(false)
                            signOut({ callbackUrl: '/' })
                          }}
                          className="block w-full text-center py-2.5 rounded-xl border border-destructive/20 text-destructive font-medium hover:bg-destructive/10 transition text-sm"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/auth/signin"
                          className="block w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition text-sm"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="block w-full text-center py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition text-sm"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
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
