"use client"

import Link from "next/link"
import { Search, User, Menu, X, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useCartStore } from "@/store/cart-store"
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AnimatePresence, motion } from "framer-motion"

type SearchResult = { id: string; name: string; slug: string };
function AutocompleteSearchBar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [show, setShow] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (search.length > 1) {
      // TODO: Replace with real API call
      fetch(`/api/products/latest?search=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then((data: SearchResult[]) => setResults(data.slice(0, 5)));
      setShow(true);
    } else {
      setShow(false);
    }
  }, [search]);
  return (
    <div className="relative w-full">
      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all shadow-sm hover:shadow-md outline-none bg-white"
        onFocus={() => setShow(search.length > 1)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <AnimatePresence>
        {show && (
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {results.length === 0 && (
              <li className="px-4 py-2 text-gray-500">No results</li>
            )}
            {results.map((item) => (
              <li
                key={item.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => router.push(`/products/${item.slug}`)}
              >
                {item.name}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getTotal, getCount } = useCartStore();
  const cartCount = getCount();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Category nav structure
  const categories = [
    { name: "Shampoo", slug: "shampoo", sub: ["Anti-Dandruff", "Volumizing", "Color Protect"] },
    { name: "Conditioners", slug: "conditioners", sub: ["Moisturizing", "Leave-In", "Repair"] },
    { name: "Treatments", slug: "treatments", sub: ["Hair Masks", "Serums", "Oils"] },
    { name: "Styling", slug: "styling", sub: ["Gels", "Sprays", "Creams"] },
    { name: "Accessories", slug: "accessories", sub: ["Combs", "Brushes", "Clips"] },
  ];

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
        className={`bg-white sticky top-0 z-50 transition-shadow ${scrolled ? "shadow-lg" : "shadow-none"}`}
        initial={false}
        animate={{ boxShadow: scrolled ? "0 2px 16px 0 rgba(0,0,0,0.08)" : "0 0px 0px 0 rgba(0,0,0,0)" }}
        transition={{ duration: 0.2 }}
      >
        <div className="container mx-auto px-4 flex items-center h-20 justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-black via-secondary to-secondary bg-clip-text text-transparent">HairCrew</span>
          </Link>

          {/* Desktop Navigation with dropdowns */}
          <nav className="hidden lg:flex items-center space-x-4 mx-8">
            {categories.map(cat => (
              <Popover key={cat.slug}>
                <PopoverTrigger asChild>
                  <button className="text-black hover:text-secondary font-medium px-3 py-2 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50">
                    {cat.name}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="mt-2 p-0 w-48 bg-white border border-gray-200 rounded-xl shadow-lg">
                  <ul className="py-2">
                    {cat.sub.map(sub => (
                      <li key={sub}>
                        <Link href={`/categories/${cat.slug}?type=${encodeURIComponent(sub)}`} className="block px-4 py-2 text-gray-700 hover:bg-secondary/10 hover:text-secondary rounded transition-colors">
                          {sub}
            </Link>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            ))}
          </nav>

          {/* Search Bar (centered, desktop) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <AutocompleteSearchBar />
          </div>

          {/* Right Side: User, Cart, Sign In */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/profile" className="hidden lg:inline-flex">
              <User className="w-6 h-6 text-black hover:text-secondary transition-colors" />
            </Link>
            {/* Cart icon with badge and popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-white">{cartCount}</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 bg-white border border-gray-200 rounded-xl shadow-lg">
                <div className="p-4 max-h-96 overflow-y-auto">
                  <p className="font-semibold mb-2">Cart Summary</p>
                  {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Your cart is empty.</div>
                  ) : (
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-3 items-center bg-white rounded-lg shadow-sm p-2 border">
                          <Image src={item.image} alt={item.name} width={48} height={48} className="rounded object-cover border w-12 h-12" />
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">
                              <Link href={`/products/${item.slug}`}>{item.name}</Link>
                            </div>
                            <div className="text-secondary font-bold mb-1 text-xs">₹{item.price}</div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                              <span className="px-2 font-medium text-xs">{item.quantity}</span>
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</Button>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-lg border bg-gray-50 p-3 mt-4">
                    <div className="flex items-center justify-between text-base font-semibold mb-2">
                      <span>Subtotal</span>
                      <span>₹{getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold mt-2">
                      <span>Total</span>
                      <span>₹{getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    disabled={items.length === 0}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white text-base font-semibold py-3 rounded-full shadow-md mt-3"
                    onClick={() => { router.push('/checkout'); }}
                  >
                    Go to Checkout
                  </Button>
                  {items.length > 0 && (
                    <Button variant="outline" onClick={clearCart} className="w-full mt-2">Clear Cart</Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
              <Link href="/auth/signin">
              <Button className="bg-secondary text-white rounded-full px-6 py-2 font-semibold shadow-md hover:bg-secondary/90 transition">Sign In</Button>
              </Link>
            {/* Hamburger for mobile */}
            <button className="lg:hidden ml-2" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
              <Menu className="w-7 h-7 text-black" />
            </button>
          </div>
        </div>

        {/* Mobile Slide-in Menu */}
        <AnimatePresence>
        {isMenuOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setIsMenuOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col p-6"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              >
                <button className="self-end mb-6" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                  <X className="w-7 h-7 text-black" />
                </button>
                <nav className="flex flex-col space-y-6 mt-4">
                  {categories.map(cat => (
                    <div key={cat.slug}>
                      <button className="text-black hover:text-secondary font-medium text-lg w-full text-left flex items-center justify-between" onClick={() => {}}>
                        {cat.name}
                        {/* TODO: Expand/collapse subcategories on mobile */}
                      </button>
                      <ul className="pl-4 mt-2 space-y-1">
                        {cat.sub.map(sub => (
                          <li key={sub}>
                            <Link href={`/categories/${cat.slug}?type=${encodeURIComponent(sub)}`} className="block px-2 py-1 text-gray-700 hover:bg-secondary/10 hover:text-secondary rounded transition-colors">
                              {sub}
              </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Link href="/dashboard/profile" className="text-black hover:text-secondary font-medium text-lg" onClick={() => setIsMenuOpen(false)}>Account</Link>
                  <Link href="/auth/signin" className="mt-4">
                    <Button className="bg-secondary text-white rounded-full w-full py-2 font-semibold shadow-md hover:bg-secondary/90 transition">Sign In</Button>
                </Link>
            </nav>
                <div className="mt-8">
                  <AutocompleteSearchBar />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
} 