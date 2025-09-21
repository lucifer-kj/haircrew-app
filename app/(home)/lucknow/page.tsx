import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'HairCrew Lucknow - Professional Hair Care Products in Lucknow',
  description: 'HairCrew delivers premium hair care products to Lucknow. Professional shampoos, conditioners, and treatments with fast delivery across Lucknow. Salon-quality results at home.',
  keywords: 'HairCrew Lucknow, hair care Lucknow, professional hair products Lucknow, salon products Lucknow, hair care Uttar Pradesh',
  openGraph: {
    title: 'HairCrew Lucknow - Professional Hair Care Products',
    description: 'Premium hair care products delivered to Lucknow. Salon-quality results at home with fast delivery across Lucknow.',
    type: 'website',
    url: 'https://www.haircrew.in/lucknow',
  },
}

export default function LucknowPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          HairCrew Lucknow - Professional Hair Care Products
        </h1>
        
        <div className="prose max-w-none mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Welcome to HairCrew Lucknow! We're proud to serve the City of Nawabs with our premium collection of professional hair care products. From Hazratganj to Gomti Nagar, we deliver salon-quality products across all areas of Lucknow.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Why Choose HairCrew in Lucknow?
          </h2>
          
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>Fast delivery across all areas of Lucknow</li>
            <li>Professional-grade hair care products</li>
            <li>Salon-quality results at home</li>
            <li>Expert recommendations for Lucknow's climate</li>
            <li>Cruelty-free and premium formulations</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Popular Areas We Serve in Lucknow
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Central Lucknow</h3>
              <p className="text-gray-700 text-sm">Hazratganj, Aminabad, Chowk</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Gomti Nagar</h3>
              <p className="text-gray-700 text-sm">Gomti Nagar, Indira Nagar, Aliganj</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Rajajipuram</h3>
              <p className="text-gray-700 text-sm">Rajajipuram, Mahanagar, Nirala Nagar</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Alambagh</h3>
              <p className="text-gray-700 text-sm">Alambagh, Charbagh, Kaiserbagh</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Product Range for Lucknow
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Professional Shampoos</h3>
              <p className="text-gray-700 text-sm">Perfect for Lucknow's climate</p>
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
              Explore our complete range of professional hair care products and experience salon-quality results at home in Lucknow.
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
