'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
import { Logo } from '@/components/ui/logo'

export function Footer() {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()

  // Do not render consumer store footer on admin routes
  if (pathname?.startsWith('/dashboard/admin') || pathname?.startsWith('/admin')) {
    return null
  }
  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={reduced ? undefined : fadeIn}
      className="bg-card text-foreground border-t border-border/80 pt-10 pb-24 lg:pb-10"
    >
      <div className="container mx-auto px-4">
        {/* Condensed footer with minimal content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and socials */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-3">
              <Logo size="default" />
            </div>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center space-x-2.5 mb-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:shahf3724@gmail.com" className="text-sm">
                shahf3724@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2.5 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4 text-primary" />
              <a href="tel:+919718707211" className="text-sm">+91 97187 07211</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/60 mt-8 pt-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-xs sm:text-sm">
              © {new Date().getFullYear()} HairCrew. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-xs sm:text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
