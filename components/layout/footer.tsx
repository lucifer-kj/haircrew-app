"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion.config";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export function Footer() {
  const reduced = useReducedMotion();
  const [ref, inView] = useScrollReveal();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={reduced ? undefined : fadeIn}
      className="bg-[var(--islamic-green)] text-white pt-8 relative"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Image src="/Images/Naaz Book Depot Logo.svg" alt="Naaz Book Depot Logo" width={36} height={36} />
              <span className="text-xl font-headings font-bold">Naaz Book Depot</span>
            </div>
            <div className="text-sm mb-3">Publishing the Light of Knowledge since 1967. Your trusted source for authentic Islamic literature, perfumes, and essentials in Kolkata, West Bengal.</div>
            <ul className="text-xs space-y-1">
              <li className="flex items-center gap-2"><span>🕌</span> Serving the Muslim community</li>
              <li className="flex items-center gap-2"><span>📚</span> Authentic Islamic literature</li>
              <li className="flex items-center gap-2"><span>🌟</span> Est. 1967 – Over 55 years of trust</li>
            </ul>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Islamic Books</Link></li>
              <li className="opacity-60">Perfumes (Coming Soon)</li>
              <li className="opacity-60">Essentials (Coming Soon)</li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          {/* Book Categories */}
          <div>
            <h3 className="text-lg font-bold mb-3">Book Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>Quran & Tafseer</li>
              <li>Hadith Collections</li>
              <li>Islamic Jurisprudence</li>
              <li>Islamic History</li>
              <li>Children&apos;s Books</li>
              <li>Urdu Literature</li>
            </ul>
          </div>
          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-bold mb-3">Contact Us</h3>
            <div className="flex items-start gap-2 mb-2"><span>📍</span><span>123 Chowringhee Road<br />Kolkata, West Bengal 700016<br />India</span></div>
            <div className="flex items-center gap-2 mb-2"><span>📞</span><span>+91 98765 43210</span></div>
            <div className="flex items-center gap-2 mb-2"><span>✉️</span><span>info@naazbookdepot.com</span></div>
            <div className="mt-4">
              <span className="font-semibold">Follow Us</span>
              <div className="flex gap-3 mt-2">
                <Link href="#"><Facebook className="w-6 h-6" /></Link>
                <Link href="#"><Instagram className="w-6 h-6" /></Link>
                <Link href="#"><Twitter className="w-6 h-6" /></Link>
                <Link href="#"><Youtube className="w-6 h-6" /></Link>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center text-xs gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <span>© 2024 Naaz Book Depot. All rights reserved.</span>
            <span className="text-[var(--islamic-gold)]">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/shipping">Shipping Info</Link>
          </div>
        </div>
        {/* Floating Back-to-Top Button */}
        {showTop && (
          <button
            onClick={handleScrollTop}
            className="fixed bottom-6 left-6 z-50 bg-[var(--islamic-gold)] text-[var(--islamic-green)] w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--islamic-gold-dark)] transition"
            aria-label="Back to top"
          >
            <ChevronUp className="w-7 h-7" />
          </button>
        )}
      </div>
    </motion.footer>
  );
} 