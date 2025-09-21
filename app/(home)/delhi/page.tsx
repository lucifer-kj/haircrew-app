import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, MapPin, Clock, Star, Users, Award, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'HairCrew Delhi - Professional Hair Care Products | Fast Delivery',
  description: 'HairCrew Delhi - Your trusted partner for professional hair care products in Delhi. Fast local delivery, salon partnerships, and expert recommendations. Serving all areas of Delhi.',
  keywords: 'HairCrew Delhi, Delhi hair care, professional hair products Delhi, salon products Delhi, hair care Delhi, fast delivery Delhi',
  openGraph: {
    title: 'HairCrew Delhi - Professional Hair Care Products',
    description: 'Delhi\'s trusted partner for professional hair care products with fast local delivery.',
    type: 'website',
    url: 'https://www.haircrew.in/delhi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HairCrew Delhi - Professional Hair Care Products',
    description: 'Delhi\'s trusted partner for professional hair care products.',
  },
  alternates: {
    canonical: 'https://www.haircrew.in/delhi',
  },
}

export default function DelhiPage() {
  // Delhi-specific structured data
  const delhiStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "HairCrew Delhi - Professional Hair Care Products",
    "description": "HairCrew Delhi - Your trusted partner for professional hair care products in Delhi with fast local delivery.",
    "url": "https://www.haircrew.in/delhi",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "HairCrew",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Delhi",
        "addressRegion": "Delhi",
        "addressCountry": "IN"
      },
      "areaServed": "Delhi",
      "telephone": "+91-9718707211"
    }
  };

  const delhiAreas = [
    "Central Delhi", "New Delhi", "South Delhi", "East Delhi", 
    "West Delhi", "North Delhi", "North East Delhi", "North West Delhi",
    "South East Delhi", "South West Delhi"
  ];

  const features = [
    {
      icon: Truck,
      title: 'Fast Delhi Delivery',
      description: 'Same-day delivery across all Delhi areas. Free delivery on orders above ₹500.',
    },
    {
      icon: MapPin,
      title: 'Delhi Coverage',
      description: 'We serve all areas of Delhi including Central, South, East, West, and North Delhi.',
    },
    {
      icon: Star,
      title: 'Salon Partnerships',
      description: 'Special pricing and support for Delhi salons. Bulk orders and professional consultations.',
    },
    {
      icon: Clock,
      title: 'Quick Service',
      description: 'Order processing within 2 hours. Customer support available 9 AM - 6 PM.',
    },
  ];

  const stats = [
    { icon: Users, label: 'Delhi Customers', value: '5,000+' },
    { icon: Award, label: 'Salon Partners', value: '200+' },
    { icon: Star, label: 'Customer Rating', value: '4.8/5' },
    { icon: Truck, label: 'Delivery Areas', value: '10+' },
  ];

  return (
    <>
      {/* Delhi Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(delhiStructuredData) }}
      />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HairCrew Delhi - Your Hair Care Partner
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Delhi's trusted destination for professional hair care products. Fast local delivery, 
            salon partnerships, and expert recommendations for all your hair care needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              🚚 Same Day Delivery
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              🏪 Salon Partnerships
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              💯 Quality Guaranteed
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              HairCrew Delhi - By the Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delhi Areas Coverage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">We Serve All Delhi Areas</h2>
            <div className="grid grid-cols-2 gap-3">
              {delhiAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{area}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Shop Now - Free Delhi Delivery
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Why Choose HairCrew Delhi?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Fast Local Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Same-day delivery across Delhi. Free delivery on orders above ₹500.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Salon Partnerships</h4>
                  <p className="text-sm text-gray-600">
                    Special pricing and support for Delhi salons. Bulk orders and consultations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Local Support</h4>
                  <p className="text-sm text-gray-600">
                    Delhi-based customer support team. Call +91-9718707211 for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Get in Touch - HairCrew Delhi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                <p className="text-gray-600">+91-9718707211</p>
                <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM, Sat 10AM-4PM</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                <p className="text-gray-600">support@haircrew.in</p>
                <p className="text-sm text-gray-500">24-hour response time</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Service Area</h3>
                <p className="text-gray-600">All Delhi Areas</p>
                <p className="text-sm text-gray-500">Fast local delivery</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
