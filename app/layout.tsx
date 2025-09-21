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
import { WebVitalsProvider } from '@/components/providers/web-vitals-provider'
import { SkipToContent } from '@/components/ui/accessibility'

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
  title: 'HairCrew - India\'s Premier Hair Care Products',
  description:
    'India\'s trusted partner for professional hair care products. Quality, innovation, and beauty in every bottle. Serving all major cities with salon-quality products.',
  // Improve SEO and sharing
  openGraph: {
    type: 'website',
    title: 'HairCrew - India\'s Premier Hair Care Products',
    description:
      'India\'s trusted partner for professional hair care products. Quality, innovation, and beauty in every bottle. Serving all major cities with salon-quality products.',
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
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.haircrew.in/" />
        {/* Open Graph */}
        <meta property="og:title" content="HairCrew Professional – Luxury Haircare Brand" />
        <meta property="og:description" content="HairCrew offers premium, cruelty-free, and innovative haircare products delivering salon-quality results at home. Serving all major cities across India with fast delivery and expert recommendations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.haircrew.in/" />
        <meta property="og:image" content="https://www.haircrew.in/logo.png" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HairCrew Professional – Luxury Salon-Quality Haircare" />
        <meta name="twitter:description" content="HairCrew offers premium, cruelty-free, and innovative haircare products delivering salon-quality results at home. Serving all major cities across India with fast delivery and expert recommendations." />
        <meta name="twitter:image" content="https://www.haircrew.in/logo.png" />
        {/* Enhanced Local Business Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "HairCrew",
          "url": "https://www.haircrew.in/",
          "logo": "https://www.haircrew.in/logo.png",
          "description": "HairCrew - India's trusted partner for professional hair care products. Quality, innovation, and beauty in every bottle. Serving all major cities across India with salon-quality products and expert recommendations.",
          "telephone": "+91 97187 07211",
          "email": "shahf3724@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Delhi",
            "addressRegion": "Delhi",
            "addressCountry": "IN"
          },
          "areaServed": [
            {
              "@type": "City",
              "name": "Delhi",
              "containedInPlace": {
                "@type": "State",
                "name": "Delhi"
              }
            },
            {
              "@type": "City",
              "name": "Kolkata",
              "containedInPlace": {
                "@type": "State",
                "name": "West Bengal"
              }
            },
            {
              "@type": "City",
              "name": "Mumbai",
              "containedInPlace": {
                "@type": "State",
                "name": "Maharashtra"
              }
            },
            {
              "@type": "City",
              "name": "Bangalore",
              "containedInPlace": {
                "@type": "State",
                "name": "Karnataka"
              }
            },
            {
              "@type": "City",
              "name": "Chennai",
              "containedInPlace": {
                "@type": "State",
                "name": "Tamil Nadu"
              }
            },
            {
              "@type": "City",
              "name": "Hyderabad",
              "containedInPlace": {
                "@type": "State",
                "name": "Telangana"
              }
            },
            {
              "@type": "City",
              "name": "Pune",
              "containedInPlace": {
                "@type": "State",
                "name": "Maharashtra"
              }
            },
            {
              "@type": "City",
              "name": "Ahmedabad",
              "containedInPlace": {
                "@type": "State",
                "name": "Gujarat"
              }
            },
            {
              "@type": "City",
              "name": "Jaipur",
              "containedInPlace": {
                "@type": "State",
                "name": "Rajasthan"
              }
            },
            {
              "@type": "City",
              "name": "Lucknow",
              "containedInPlace": {
                "@type": "State",
                "name": "Uttar Pradesh"
              }
            }
          ],
          "serviceArea": {
            "@type": "Country",
            "name": "India"
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Saturday",
              "opens": "10:00",
              "closes": "16:00"
            }
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Hair Care Products",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Professional Shampoos"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Hair Conditioners"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Hair Treatments"
                }
              }
            ]
          },
          "makesOffer": [
            {
              "@type": "Offer",
              "name": "Pan-India Delivery",
              "description": "Fast delivery to all major cities across India",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "areaServed": {
                "@type": "Country",
                "name": "India"
              }
            },
            {
              "@type": "Offer",
              "name": "Salon Partnership Program",
              "description": "Special pricing and support for salons across India",
              "availability": "https://schema.org/InStock",
              "areaServed": {
                "@type": "Country",
                "name": "India"
              }
            }
          ],
          "sameAs": [
            "https://www.facebook.in/haircrew",
            "https://www.instagram.in/haircrew"
          ],
          "foundingDate": "2020",
          "numberOfEmployees": "10-50",
          "knowsAbout": ["Hair Care", "Professional Hair Products", "Salon Quality Products", "Hair Treatment", "Hair Styling", "India Hair Care", "Pan India Delivery", "Professional Haircare India"],
          "keywords": "HairCrew, India hair care, professional hair products India, salon products India, hair care India, Kolkata hair care, Delhi hair care, Mumbai hair care, Bangalore hair care, Chennai hair care, Hyderabad hair care, Pune hair care, Ahmedabad hair care, Jaipur hair care, Lucknow hair care"
        }) }} />
        {/* Favicon & Manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
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
            <WebVitalsProvider />
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
          </ClientRoot>
        </AuthProvider>
      </body>
    </html>
  )
}
