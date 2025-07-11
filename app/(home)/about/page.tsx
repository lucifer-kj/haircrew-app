import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, Truck, Star, Users, Award } from "lucide-react"
import NewsletterSection from "@/components/newsletter-section"

export default function AboutPage() {
  const features = [
    {
      icon: Heart,
      title: "Quality Products",
      description: "We source only the finest hair care products from trusted brands."
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Your data and payments are protected with industry-standard security."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to get your products to you fast."
    },
    {
      icon: Star,
      title: "Customer Satisfaction",
      description: "We&apos;re committed to providing excellent customer service."
    }
  ]

  const stats = [
    { icon: Users, label: "Happy Customers", value: "10,000+" },
    { icon: Award, label: "Years of Experience", value: "5+" },
    { icon: Star, label: "Product Rating", value: "4.8/5" },
    { icon: Heart, label: "Products Sold", value: "50,000+" }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About HairCrew</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted destination for premium hair care products. We&apos;re passionate about helping you achieve healthy, beautiful hair.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            At HairCrew, we believe that everyone deserves access to high-quality hair care products that nourish and protect their hair. 
            Our mission is to provide a curated selection of the best hair care products, backed by expert advice and exceptional customer service. 
            We&apos;re committed to helping you discover products that work for your unique hair type and styling needs.
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => {
          const IconComponent = feature.icon
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
          )
        })}
      </div>

      {/* Stats Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Why Choose HairCrew?</CardTitle>
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
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              HairCrew was founded with a simple vision: to make premium hair care accessible to everyone. 
              What started as a small local store has grown into a trusted online destination for hair care enthusiasts.
            </p>
            <p>
              Our team of hair care experts carefully curates every product in our collection, ensuring that 
              we only offer items that meet our high standards for quality and effectiveness.
            </p>
            <p>
              We believe that great hair starts with great products, and we&apos;re here to help you find exactly 
              what your hair needs to look and feel its best.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Our Values</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Quality</Badge>
              <span className="text-sm">We never compromise on product quality</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Trust</Badge>
              <span className="text-sm">Building lasting relationships with our customers</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Innovation</Badge>
              <span className="text-sm">Always staying ahead with the latest products</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Community</Badge>
              <span className="text-sm">Supporting and educating our hair care community</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Newsletter Section - Only on About page */}
      <div className="mt-16">
        <NewsletterSection />
      </div>
    </div>
  )
} 