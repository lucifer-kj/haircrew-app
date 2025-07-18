'use client'

import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion.config'
import { useScrollReveal } from '@/lib/useScrollReveal'
import { useReducedMotion } from '@/lib/useReducedMotion'

export function Footer() {
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()
  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={reduced ? undefined : fadeIn}
      className="hidden bg-[#f7f6f3] text-black pt-8 lg:block"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Condensed footer with minimal content */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and socials */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-black via-secondary to-secondary bg-clip-text text-transparent mb-4">
              HairCrew
            </span>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-700 hover:text-secondary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-secondary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-secondary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-secondary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center space-x-3 mb-2">
              <Mail className="w-4 h-4 text-secondary" />
              <span className="text-secondary text-sm">
                support@haircrew.com
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-secondary" />
              <span className="text-secondary text-sm">+1 (555) 123-4567</span>
            </div>
          </div>
        </div>

        {/* Bottom bar - even more condensed */}
        <div className="border-t border-gray-300 mt-6 pt-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-700 text-sm">
              © 2024 HairCrew. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <Link
                href="/privacy"
                className="text-gray-700 hover:text-secondary transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-700 hover:text-secondary transition-colors text-sm"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
