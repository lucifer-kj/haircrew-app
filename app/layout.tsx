import React from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/session-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import ClientRoot from '@/components/providers/client-root'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import AnimatedLayoutClient from '@/components/providers/animated-layout-client'
import RoutePrefetcher from '@/components/providers/route-prefetch'
import { Toaster } from 'sonner'
import { SkipToContent } from '@/components/ui/accessibility'
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import ReactPlugin from '@stagewise-plugins/react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
})

export const metadata: Metadata = {
  title: 'HairCrew - Professional Hair Care Products',
  description:
    'Your trusted partner for professional hair care products. Quality, innovation, and beauty in every bottle.',
  // Improve SEO and sharing
  openGraph: {
    type: 'website',
    title: 'HairCrew - Professional Hair Care Products',
    description:
      'Your trusted partner for professional hair care products. Quality, innovation, and beauty in every bottle.',
    siteName: 'HairCrew',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* SEO Meta Tags */}
        <title>HairCrew Professional – Luxury Salon-Quality Haircare</title>
        <meta name="description" content="HairCrew offers premium, cruelty-free, and innovative haircare products delivering salon-quality results at home. Discover the luxury of self-care with HairCrew." />
        <meta name="keywords" content="HairCrew, luxury haircare, salon-quality shampoo, keratin treatment, cruelty-free hair products, premium haircare brand" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.haircrew.in/" />
        {/* Open Graph */}
        <meta property="og:title" content="HairCrew Professional – Luxury Haircare Brand" />
        <meta property="og:description" content="Indulge in HairCrew’s premium, cruelty-free formulas designed for salon-quality results at home. Experience opulence in every bottle." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.haircrew.in/" />
        <meta property="og:image" content="https://www.haircrew.in/assets/og-image.jpg" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HairCrew Professional – Luxury Salon-Quality Haircare" />
        <meta name="twitter:description" content="HairCrew offers premium, cruelty-free, and innovative haircare products delivering salon-quality results at home. Discover the luxury of self-care with HairCrew." />
        <meta name="twitter:image" content="https://www.haircrew.in/assets/og-image.jpg" />
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "HairCrew Professional",
          "url": "https://www.haircrew.in/",
          "logo": "https://www.haircrew.in/assets/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-9718707211",
            "contactType": "Customer Service",
            "areaServed": "IN",
            "availableLanguage": "English"
          },
          "sameAs": [
            "https://www.facebook.in/haircrew",
            "https://www.instagram.in/haircrew"
          ]
        }) }} />
        {/* Favicon & Manifest */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Preconnect to important domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Preload critical assets */}
        <link rel="preload" href="/Images/banner1.jpg" as="image" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ClientRoot>
            <div className="min-h-screen flex flex-col">
              <SkipToContent />
              <Header />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                <ErrorBoundary>
                  <AnimatedLayoutClient>{children}</AnimatedLayoutClient>
                </ErrorBoundary>
              </main>
              <Footer />
              {/* Route prefetcher - improves navigation performance */}
              <RoutePrefetcher />
            </div>
            <Toaster position="top-center" richColors />
            <StagewiseToolbar
              config={{
                plugins: [ReactPlugin],
              }}
            />
          </ClientRoot>
        </AuthProvider>
      </body>
    </html>
  )
}
