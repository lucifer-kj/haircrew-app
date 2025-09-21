export const dynamic = 'force-dynamic'
export const revalidate = 300
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
        <p className="text-gray-600">
          Browse our wide range of hair care products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <Link key={category.id} href={`/products?category=${category.slug}`}>
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">
                    {category._count.products} products
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </CardTitle>
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
                {category.image && (
                  <div className="mt-4 relative h-32 rounded-lg overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No categories found.</p>
        </div>
      )}
    </div>
  )
}
