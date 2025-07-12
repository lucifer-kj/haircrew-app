"use client"

import Link from "next/link"
import { Search, ShoppingCart, User as UserIcon } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { motion } from "framer-motion"
import Image from "next/image";


export function Header() {
  const { getCount } = useCartStore();
  const cartCount = getCount();
  // Remove all references to 'scrolled'
  return (
    <>
      <motion.header
        className={`bg-[#F8F6F3] sticky top-0 z-50 transition-shadow border-b border-[var(--islamic-green)]/10`}
        initial={false}
        animate={{ boxShadow: "0 0px 0px 0 rgba(0,0,0,0)" }}
        transition={{ duration: 0.2 }}
      >
        <div className="container mx-auto px-4 flex items-center h-24 justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-4 group">
            <Image src="/Images/Naaz Book Depot Logo.svg" alt="Naaz Book Depot Logo" width={48} height={48} className="h-12 w-12" />
            <div className="flex flex-col">
              <span className="text-3xl font-headings font-bold text-[var(--islamic-green)] leading-tight group-hover:opacity-80 transition">Naaz Book Depot</span>
              <span className="text-xs text-[var(--islamic-green)]/80 -mt-1">Publishing the Light of Knowledge</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 mx-8">
            <Link href="/" className="nav-link">Home</Link>
            <div className="relative group">
              <button className="nav-link flex items-center gap-1 focus:outline-none">Products <span className="ml-1">▼</span></button>
              <div className="absolute left-0 top-full mt-2 bg-white border border-[var(--islamic-green)]/20 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition z-20 min-w-[180px]">
                <ul className="py-2">
                  <li><Link href="/categories/shampoo" className="block px-4 py-2 text-[var(--islamic-green)] hover:bg-[var(--islamic-gold)]/10">Quran & Tafseer</Link></li>
                  <li><Link href="/categories/conditioner" className="block px-4 py-2 text-[var(--islamic-green)] hover:bg-[var(--islamic-gold)]/10">Hadith Collections</Link></li>
                  <li><Link href="/categories/treatment" className="block px-4 py-2 text-[var(--islamic-green)] hover:bg-[var(--islamic-gold)]/10">Islamic Jurisprudence</Link></li>
                  <li><Link href="/categories/history" className="block px-4 py-2 text-[var(--islamic-green)] hover:bg-[var(--islamic-gold)]/10">Islamic History</Link></li>
                  <li><Link href="/categories/children" className="block px-4 py-2 text-[var(--islamic-green)] hover:bg-[var(--islamic-gold)]/10">Children&apos;s Books</Link></li>
                  <li><Link href="/categories/urdu" className="block px-4 py-2 text-[var(--islamic-green)] hover:bg-[var(--islamic-gold)]/10">Urdu Literature</Link></li>
                </ul>
              </div>
            </div>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            <Link href="/search" className="p-2 text-[var(--islamic-green)] hover:text-[var(--islamic-gold)]"><Search className="w-6 h-6" /></Link>
            <Link href="/cart" className="relative p-2 text-[var(--islamic-green)] hover:text-[var(--islamic-gold)]">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--islamic-gold)] text-[var(--islamic-green)] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/dashboard/profile" className="p-2 text-[var(--islamic-green)] hover:text-[var(--islamic-gold)]"><UserIcon className="w-6 h-6" /></Link>
          </div>
        </div>
      </motion.header>
      {/* Contact Info Bar */}
      <div className="hidden md:flex items-center justify-center bg-[var(--islamic-green)] text-white text-sm font-medium px-8 py-2">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><span className="font-bold">📞</span> 033 22350051</span>
          <span className="flex items-center gap-2 border-l border-white/30 pl-6"><span className="font-bold">📞</span> 033 22350960</span>
          <span className="flex items-center gap-2 border-l border-white/30 pl-6"><span className="font-bold">📱</span> +91 91634 31395</span>
          <span className="flex items-center gap-2 border-l border-white/30 pl-6"><span className="font-bold">✉️</span> naazgroupofficial@gmail.com</span>
          <span className="flex items-center gap-2 border-l border-white/30 pl-6"><span className="font-bold">📍</span> Visit us in Kolkata, West Bengal</span>
        </div>
      </div>
      {/* Mobile Navigation and TabBar remain unchanged */}
      {/* ...existing code... */}
    </>
  );
} 