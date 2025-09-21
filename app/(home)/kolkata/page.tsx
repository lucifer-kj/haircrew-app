import { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HairCrew Kolkata - Professional Hair Care Products in Kolkata',
  description: 'HairCrew delivers premium hair care products to Kolkata. Professional shampoos, conditioners, and treatments with fast delivery across Kolkata. Salon-quality results at home.',
  keywords: 'HairCrew Kolkata, hair care Kolkata, professional hair products Kolkata, salon products Kolkata, hair care West Bengal',
  openGraph: {
    title: 'HairCrew Kolkata - Professional Hair Care Products',
    description: 'Premium hair care products delivered to Kolkata. Salon-quality results at home with fast delivery across Kolkata.',
    type: 'website',
    url: 'https://www.haircrew.in/kolkata',
  },
}

export default function KolkataPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          HairCrew Kolkata - Professional Hair Care Products
        </h1>
        
        <div className="prose max-w-none mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Welcome to HairCrew Kolkata! We&apos;re proud to serve the vibrant city of Kolkata with our premium collection of professional hair care products. Whether you&apos;re in Salt Lake, Park Street, or anywhere in Kolkata, we deliver salon-quality products right to your doorstep.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Why Choose HairCrew in Kolkata?
          </h2>
          
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>Fast delivery across all areas of Kolkata</li>
            <li>Professional-grade hair care products</li>
            <li>Salon-quality results at home</li>
            <li>Expert recommendations for Kolkata&apos;s climate</li>
            <li>Cruelty-free and premium formulations</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Popular Areas We Serve in Kolkata
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Central Kolkata</h3>
              <p className="text-gray-700 text-sm">Park Street, Esplanade, Dalhousie, BBD Bagh</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Salt Lake</h3>
              <p className="text-gray-700 text-sm">Salt Lake City, Sector V, New Town</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">South Kolkata</h3>
              <p className="text-gray-700 text-sm">Ballygunge, Gariahat, Jadavpur, Tollygunge</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">North Kolkata</h3>
              <p className="text-gray-700 text-sm">Shyambazar, Bagbazar, Sovabazar, Maniktala</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Product Range for Kolkata
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Professional Shampoos</h3>
              <p className="text-gray-700 text-sm">Perfect for Kolkata&apos;s humid climate and hard water</p>
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
              Explore our complete range of professional hair care products and experience salon-quality results at home in Kolkata.
            </p>
            <Link 
              href="/products" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
