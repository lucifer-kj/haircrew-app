import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'support@haircrew.com',
      description: 'We&apos;ll respond within 24 hours',
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '+91 98765 43210',
      description: 'Mon-Fri from 9am to 6pm',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: '123 Hair Street, Beauty City, BC 12345',
      description: 'Visit our store',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Saturday',
      description: '9:00 AM - 8:00 PM',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions? We&apos;d love to hear from you. Send us a message and
          we&apos;ll respond as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <Input placeholder="John" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <Input placeholder="Doe" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" placeholder="john@example.com" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <Input placeholder="How can we help?" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Textarea
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {info.title}
                        </h3>
                        <p className="text-gray-700">{info.details}</p>
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    How long does shipping take?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Standard shipping takes 3-5 business days. Express shipping
                    is available for faster delivery.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    What is your return policy?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We offer a 30-day return policy for unused items in original
                    packaging.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Do you ship internationally?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Currently, we ship to all major cities in India.
                    International shipping coming soon!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
