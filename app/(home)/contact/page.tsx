
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact HairCrew - Get in Touch',
  description: 'Contact HairCrew for customer support, product inquiries, or business partnerships. We\'re here to help with all your hair care needs.',
  keywords: 'contact HairCrew, customer support, hair care help, HairCrew contact',
  openGraph: {
    title: 'Contact HairCrew - Get in Touch',
    description: 'Contact HairCrew for customer support, product inquiries, or business partnerships.',
    type: 'website',
    url: 'https://www.haircrew.in/contact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact HairCrew - Get in Touch',
    description: 'Contact HairCrew for customer support, product inquiries, or business partnerships.',
  },
  alternates: {
    canonical: 'https://www.haircrew.in/contact',
  },
}

export default function ContactPage() {
  // FAQ structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I choose the right products?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our product pages include detailed descriptions and recommendations based on hair type. You can also contact us for personalized advice."
        }
      },
      {
        "@type": "Question",
        "name": "What's your return policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a 30-day return policy for unused products in original packaging. Contact us to initiate a return."
        }
      },
      {
        "@type": "Question",
        "name": "How long does shipping take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Delhi: Same-day delivery available. Other cities: Standard shipping takes 3-5 business days. Express shipping options are available for faster delivery."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer bulk discounts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Contact us for wholesale pricing and bulk order discounts for salons and businesses."
        }
      }
    ]
  };

  return (
    <>
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Contact HairCrew
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get in touch with us for any questions, support, or feedback. We&apos;re here to help with all your hair care needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-gray-600">+91 97187 07211</p>
                  <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-gray-600">shahf3724@gmail.com</p>
                  <p className="text-sm text-gray-500">We&apos;ll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Address</h3>
                  <p className="text-gray-600">
                    HairCrew Professional<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Why Contact Us?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Product Support</h4>
                  <p className="text-gray-600">
                    Need help choosing the right products for your hair type? Our experts are here to guide you.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Order Assistance</h4>
                  <p className="text-gray-600">
                    Questions about your order, shipping, or returns? We&apos;ll help resolve any issues quickly.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Business Inquiries</h4>
                  <p className="text-gray-600">
                    Interested in partnerships, wholesale, or other business opportunities? Let&apos;s talk.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-lg mb-2">How do I choose the right products?</h4>
                <p className="text-gray-600">
                  Our product pages include detailed descriptions and recommendations based on hair type. You can also contact us for personalized advice.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">What&apos;s your return policy?</h4>
                <p className="text-gray-600">
                  We offer a 30-day return policy for unused products in original packaging. Contact us to initiate a return.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">How long does shipping take?</h4>
                <p className="text-gray-600">
                  <strong>Delhi:</strong> Same-day delivery available. <strong>Other cities:</strong> Standard shipping takes 3-5 business days. Express shipping options are available for faster delivery.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Do you offer bulk discounts?</h4>
                <p className="text-gray-600">
                  Yes! Contact us for wholesale pricing and bulk order discounts for salons and businesses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
}
