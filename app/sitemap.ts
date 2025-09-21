import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.haircrew.in'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/delhi`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // City-specific pages for pan-India coverage
  const cityPages = [
    { city: 'kolkata', priority: 0.8 },
    { city: 'mumbai', priority: 0.8 },
    { city: 'bangalore', priority: 0.8 },
    { city: 'chennai', priority: 0.8 },
    { city: 'hyderabad', priority: 0.8 },
    { city: 'pune', priority: 0.7 },
    { city: 'ahmedabad', priority: 0.7 },
    { city: 'jaipur', priority: 0.7 },
    { city: 'lucknow', priority: 0.7 },
  ].map(city => ({
    url: `${baseUrl}/${city.city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: city.priority,
  }))

  try {
    // Dynamic product pages
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      where: { isActive: true },
    })

    const productPages = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Dynamic category pages
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      where: { isActive: true },
    })

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...cityPages, ...productPages, ...categoryPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages if database is unavailable
    return [...staticPages, ...cityPages]
  }
}
