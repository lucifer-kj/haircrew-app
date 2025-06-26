"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
  categoryId: string
}

interface ProductsResponse {
  products: Product[]
  total: number
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string>("all")
  const [stockStatus, setStockStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 9

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    let url = `/api/products?page=${currentPage}&pageSize=${pageSize}`
    if (selectedCategory) url += `&category=${selectedCategory}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (priceRange !== "all") url += `&priceRange=${priceRange}`
    if (stockStatus !== "all") url += `&stockStatus=${stockStatus}`
    if (sortBy !== "newest") url += `&sortBy=${sortBy}`
    
    fetch(url)
      .then(res => res.json())
      .then((data: ProductsResponse) => {
        setProducts(data.products)
        setTotal(data.total)
      })
      .finally(() => setLoading(false))
  }, [selectedCategory, search, priceRange, stockStatus, sortBy, currentPage])

  const totalPages = Math.ceil(total / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 min-h-screen">
      {/* Sidebar */}
      <aside className="md:col-span-1 bg-white rounded-lg shadow p-6 h-fit">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <ul className="space-y-2 mb-6">
          <li>
            <button
              className={`w-full text-left px-2 py-1 rounded ${!selectedCategory ? 'bg-[var(--primary)] text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button
                className={`w-full text-left px-2 py-1 rounded ${selectedCategory === cat.id ? 'bg-[var(--primary)] text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-25">$0 - $25</SelectItem>
            <SelectItem value="25-50">$25 - $50</SelectItem>
            <SelectItem value="50-100">$50 - $100</SelectItem>
            <SelectItem value="100+">$100+</SelectItem>
          </SelectContent>
        </Select>

        <h3 className="text-lg font-semibold mb-3 mt-6">Stock Status</h3>
        <Select value={stockStatus} onValueChange={setStockStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select stock status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </aside>

      {/* Main Content */}
      <main className="md:col-span-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-600 mt-1">
              {loading ? "Loading..." : `${total} product${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">No products found.</div>
          ) : (
            products.map(product => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center">
                  <Link href={`/products/${product.slug}`}>
                    <Image src={product.images[0] || "/Images/p1.jpg"} alt={product.name} width={300} height={200} className="rounded-md object-cover mb-4" />
                  </Link>
                  <CardTitle className="text-lg font-semibold mb-2 text-center">{product.name}</CardTitle>
                  <div className="text-[var(--primary)] font-bold text-xl mb-2">${product.price}</div>
                  <Link href={`/products/${product.slug}`} className="text-[var(--primary)] underline mt-2">View Product</Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => handlePageChange(pageNum)}
                  className="w-10 h-10"
                >
                  {pageNum}
                </Button>
              )
            })}
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
} 