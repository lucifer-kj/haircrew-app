"use client";

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import NewsletterSection from "@/components/newsletter-section";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion.config";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function Footer() {
  const reduced = useReducedMotion();
  const [ref, inView] = useScrollReveal();
  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={reduced ? undefined : fadeIn}
      className="bg-[#f7f6f3] text-black pt-0"
    >
      {/* Newsletter Signup Section */}
      <NewsletterSection />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-black">HairCrew</span>
            </div>
            <p className="text-gray-700 text-sm">
              Your trusted partner for professional hair care products. 
              Quality, innovation, and beauty in every bottle.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-700 hover:text-secondary transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-700 hover:text-secondary transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-700 hover:text-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-700 hover:text-secondary transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links (Explore Section) */}
          <div className="space-y-4 bg-gradient-to-br from-secondary to-[#B13BFF] text-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:underline transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:underline transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-700 hover:text-secondary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-700 hover:text-secondary transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-700 hover:text-secondary transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-700 hover:text-secondary transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-700 hover:text-secondary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-secondary text-sm">support@haircrew.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-secondary" />
                <span className="text-secondary text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-secondary mt-1" />
                <span className="text-secondary text-sm">
                  123 Beauty Street<br />
                  New York, NY 10001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-700 text-sm">
              © 2024 HairCrew. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-700 hover:text-secondary transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-700 hover:text-secondary transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-700 hover:text-secondary transition-colors text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Instagram Section */}
      <div className="container mx-auto px-4 pb-8">
        <h3 className="text-center text-lg font-semibold mb-4">Follow On <span className="italic font-light">Instagram</span></h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-200 rounded-xl h-24" />
          <div className="bg-gray-200 rounded-xl h-24" />
          <div className="bg-gray-200 rounded-xl h-24" />
          <div className="bg-gray-200 rounded-xl h-24" />
        </div>
      </div>
    </motion.footer>
  )
} 