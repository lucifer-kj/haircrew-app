import React, { useState, useEffect } from 'react'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/lib/uploadthing'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { Product } from '@/types/product'

interface ProductFormProps {
  onClose: () => void
  onSuccess: () => void
  initialData?: {
    name: string
    price: number
    stock: number
    categoryId: string
    images: string[]
  }
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

interface Category {
  id: string
  name: string
}

export default function ProductForm({
  onClose,
  onSuccess,
  initialData,
  setProducts,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [stock, setStock] = useState(initialData?.stock?.toString() || '')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploading, setUploading] = useState(false)
  const MAX_IMAGES = 5
  const [sku, setSku] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        setCategories(Array.isArray(data.categories) ? data.categories : [])
      } catch {
        toast.error('Failed to load categories')
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const handleUploadComplete = (res: { url: string }[]) => {
    setUploading(false)
    setImages(prev => {
      const newUrls = res.map(f => f.url).filter(url => !prev.includes(url))
      const updatedImages = [...prev, ...newUrls].slice(0, MAX_IMAGES)
      if (newUrls.length !== res.length) {
        toast.warning('Some duplicate images were ignored')
      }
      if (updatedImages.length === MAX_IMAGES) {
        toast.info(`Maximum of ${MAX_IMAGES} images reached`)
      }
      return updatedImages
    })
  }

  const handleUploadError = (error: Error) => {
    setUploading(false)
    toast.error(`Upload failed: ${error.message}`)
  }

  const handleRemoveImage = (url: string) => {
    setImages(prev => prev.filter(img => img !== url))
  }

  const canUploadMore = images.length < MAX_IMAGES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!name.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!price || isNaN(Number(price))) {
      toast.error('Valid price is required')
      return
    }
    if (!stock || isNaN(Number(stock))) {
      toast.error('Valid stock quantity is required')
      return
    }
    if (!categoryId) {
      toast.error('Category is required')
      return
    }
    if (!sku.trim() || sku.length < 3) {
      toast.error('SKU is required and must be at least 3 characters')
      return
    }
    setLoading(true)
    const tempId = 'temp-' + Date.now()
    const newProduct: Product = {
      id: tempId,
      name,
      description: '',
      price: Number(price),
      comparePrice: undefined,
      stock: Number(stock),
      categoryId,
      images,
      sku,
      isActive: true,
      isFeatured: false,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      category: categories.find(c => c.id === categoryId) ? { name: categories.find(c => c.id === categoryId)!.name } : undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }
    // Optimistic update
    setProducts(prev => [...prev, newProduct])
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: Number(stock),
          categoryId,
          images,
          sku,
        })
      })
      const data = await response.json()
      if (!response.ok) {
        setProducts(prev => prev.filter(p => p.id !== tempId))
        toast.error(data.error || (data.errors && data.errors[0]) || 'Failed to create product')
        console.error('Product creation failed:', data)
        return
      }
      setProducts(prev => prev.map(p => p.id === tempId ? data.data : p))
      toast.success('Product created successfully')
      console.log('Product created:', data.data)
      onSuccess()
    } catch (error) {
      setProducts(prev => prev.filter(p => p.id !== tempId))
      toast.error('Failed to create product')
      console.error('Product creation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="product-name">Name</Label>
        <Input
          id="product-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-price">Price</Label>
          <Input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-stock">Stock</Label>
          <Input
            id="product-stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="product-category">Category</Label>
        <Select 
          value={categoryId} 
          onValueChange={setCategoryId} 
          required
        >
          <SelectTrigger id="product-category" className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-categories" disabled>
                No categories available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="product-sku">SKU</Label>
        <Input
          id="product-sku"
          type="text"
          value={sku}
          onChange={e => setSku(e.target.value.toUpperCase())}
          placeholder="E.g. ABC-123"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Images</Label>
        <div className="text-sm text-muted-foreground mb-3">
          {images.length}/{MAX_IMAGES} images uploaded
        </div>

        {canUploadMore && (
          <UploadButton<OurFileRouter, 'productImage'>
            endpoint="productImage"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={() => setUploading(true)}
            appearance={{
              button: "w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-100 transition-colors text-base sm:text-lg",
              allowedContent: "hidden",
            }}
            content={{
              button: () => {
                return (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Upload className="w-8 h-8 mb-2 text-gray-300" />
                    <p className="mb-1 text-sm text-gray-300">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, JPEG (max. 5MB each)
                    </p>
                  </div>
                );
              }
            }}
          />
        )}

        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            Uploading images...
          </div>
        )}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
            {images.map((url) => (
              <div
                key={url}
                className="relative group rounded-md overflow-hidden aspect-square border"
              >
                <Image
                  src={url}
                  alt="Product preview"
                  width={200}
                  height={200}
                  className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                  priority={false}
                  loading="lazy"
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-90 hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : (
            'Save Product'
          )}
        </Button>
      </div>
    </form>
  )
}