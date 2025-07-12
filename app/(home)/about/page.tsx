import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Heart, Shield, Truck, Star, Users, Award } from "lucide-react"
import NewsletterSection from "@/components/newsletter-section"

export default function AboutPage() {
  const features = [
    {
      icon: Star,
      title: "Authentic Books",
      description: "We curate only the most authentic and reliable Islamic books from trusted publishers."
    },
    {
      icon: Award,
      title: "Scholarly Selection",
      description: "Our collection is handpicked by scholars and experts in Islamic studies."
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Your data and payments are protected with industry-standard security."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to get your books to you fast."
    }
  ];

  const stats = [
    { icon: Users, label: "Happy Readers", value: "10,000+" },
    { icon: Award, label: "Years Serving Knowledge", value: "5+" },
    { icon: Star, label: "Book Rating", value: "4.9/5" },
    { icon: Heart, label: "Books Delivered", value: "50,000+" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Naaz Book Depot</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted destination for authentic Islamic books. We are passionate about spreading knowledge and light through carefully curated literature.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            At Naaz Book Depot, we believe that everyone deserves access to authentic Islamic knowledge. Our mission is to provide a curated selection of the best Islamic books, backed by expert advice and exceptional service. We are committed to helping you discover books that inspire, educate, and uplift.
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Our Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Naaz Book Depot was founded with a simple vision: to make authentic Islamic knowledge accessible to everyone. What started as a small local store has grown into a trusted online destination for readers and seekers of knowledge.
            </p>
            <p>
              Our team of scholars and book lovers carefully curates every book in our collection, ensuring that we only offer items that meet our high standards for authenticity and benefit.
            </p>
            <p>
              We believe that great communities are built on great knowledge, and we are here to help you find exactly what you need to grow in faith and understanding.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Image src="/Images/About Naaz Book Depot.jpg" alt="About Naaz Book Depot" width={400} height={400} className="rounded-xl shadow-lg w-full max-w-md" />
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="mt-16">
        <NewsletterSection />
      </div>
    </div>
  );
} 