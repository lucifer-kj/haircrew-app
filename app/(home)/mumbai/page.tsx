import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'HairCrew Mumbai - Professional Hair Care Products in Mumbai',
  description: 'HairCrew delivers premium hair care products to Mumbai. Professional shampoos, conditioners, and treatments with fast delivery across Mumbai. Salon-quality results at home.',
  keywords: 'HairCrew Mumbai, hair care Mumbai, professional hair products Mumbai, salon products Mumbai, hair care Maharashtra',
  openGraph: {
    title: 'HairCrew Mumbai - Professional Hair Care Products',
    description: 'Premium hair care products delivered to Mumbai. Salon-quality results at home with fast delivery across Mumbai.',
    type: 'website',
    url: 'https://www.haircrew.in/mumbai',
  },
}

export default function MumbaiPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          HairCrew Mumbai - Professional Hair Care Products
        </h1>
        
        <div className="prose max-w-none mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Welcome to HairCrew Mumbai! We're excited to serve the bustling city of Mumbai with our premium collection of professional hair care products. From Bandra to Powai, we deliver salon-quality products across all areas of Mumbai.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Why Choose HairCrew in Mumbai?
          </h2>
          
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>Same-day delivery in select Mumbai areas</li>
            <li>Professional-grade hair care products</li>
            <li>Salon-quality results at home</li>
            <li>Expert recommendations for Mumbai's climate</li>
            <li>Cruelty-free and premium formulations</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Popular Areas We Serve in Mumbai
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">South Mumbai</h3>
              <p className="text-gray-700 text-sm">Colaba, Fort, Marine Drive, Nariman Point</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Bandra & Khar</h3>
              <p className="text-gray-700 text-sm">Bandra West, Khar West, Santacruz</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Powai & Andheri</h3>
              <p className="text-gray-700 text-sm">Powai, Andheri West, Juhu, Versova</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Thane & Navi Mumbai</h3>
              <p className="text-gray-700 text-sm">Thane, Vashi, Nerul, Belapur</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Product Range for Mumbai
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Professional Shampoos</h3>
              <p className="text-gray-700 text-sm">Perfect for Mumbai's humid climate and pollution</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Hair Conditioners</h3>
              <p className="text-gray-700 text-sm">Nourishing formulas for healthy, manageable hair</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Hair Treatments</h3>
              <p className="text-gray-700 text-sm">Repair and restore treatments for damaged hair</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Ready to Transform Your Hair?</h3>
            <p className="text-blue-800 mb-4">
              Explore our complete range of professional hair care products and experience salon-quality results at home in Mumbai.
            </p>
            <a 
              href="/products" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
