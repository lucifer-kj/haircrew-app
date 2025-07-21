'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  slug: string
  isActive: boolean
}

interface CategoryFormProps {
  onClose: () => void
  onSuccess: () => void
  initialData?: Category | null
}

export default function CategoryForm({ onClose, onSuccess, initialData }: CategoryFormProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description || '',
        image: initialData.image || '',
        isActive: initialData.isActive
      })
      if (initialData.image) {
        setImagePreview(initialData.image)
      }
    }
  }, [initialData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setForm(prev => ({ ...prev, image: '' }))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/uploadthing', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setLoading(true)
    
    try {
      let imageUrl = form.image
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const payload = {
        ...form,
        image: imageUrl,
        name: form.name.trim(),
        description: form.description.trim() || undefined
      }

      const url = initialData 
        ? `/api/admin/categories/${initialData.id}`
        : '/api/admin/categories'
      
      const method = initialData ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save category')
      }

      toast.success(`Category ${initialData ? 'updated' : 'created'} successfully`)
      onSuccess()
    } catch (error) {
      console.error('Category save error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter category name"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter category description"
          rows={3}
        />
      </div>

      {/* Image Upload */}
      <div>
        <Label>Category Image</Label>
        <div className="mt-2">
          {imagePreview ? (
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Preview"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700">Upload an image</span>
                <span className="text-gray-500"> or drag and drop</span>
              </Label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {initialData ? 'Update Category' : 'Create Category'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
} 