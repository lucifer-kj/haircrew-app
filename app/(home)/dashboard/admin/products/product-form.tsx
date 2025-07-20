import React, { useState } from 'react'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/lib/uploadthing'
import Image from 'next/image'
import { toast } from 'sonner'

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
}

export default function ProductForm({
  onClose,
  onSuccess,
  initialData,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [stock, setStock] = useState(initialData?.stock?.toString() || '')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [loading, setLoading] = useState(false)

  const handleUploadComplete = (res: { url: string }[]) => {
    setImages(res.map(f => f.url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Call create/update API
    // Convert price and stock to numbers before sending
    // const productData = {
    //   name,
    //   price: Number(price),
    //   stock: Number(stock),
    //   categoryId,
    //   images,
    // };
    // ...API call with productData
    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Stock</label>
        <input
          type="number"
          value={stock}
          onChange={e => setStock(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category ID</label>
        <input
          type="text"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Images</label>
        <UploadButton<OurFileRouter, 'productImage'>
          endpoint="productImage"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error: Error) => {
            toast.error(error.message)
          }}
        />
        <div className="flex gap-2 mt-2">
          {images.map(url => (
            <Image
              key={url}
              src={url}
              alt="Product"
              width={64}
              height={64}
              className="object-cover rounded"
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded bg-slate-500 text-white"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-white"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}
