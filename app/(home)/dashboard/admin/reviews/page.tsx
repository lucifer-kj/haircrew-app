'use client'
import { Review } from '@prisma/client'
import { useEffect, useState } from 'react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load reviews.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Product Reviews</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : reviews.length === 0 ? (
        <div>No reviews found.</div>
      ) : (
        <>
          {/* Table for md+ */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2">Product</th>
                  <th className="p-2">User</th>
                  <th className="p-2">Rating</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Comment</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2 whitespace-nowrap">{r.productId || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{r.userId || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{r.rating}</td>
                    <td className="p-2 whitespace-nowrap">{r.title || '-'}</td>
                    <td className="p-2 whitespace-pre-line max-w-xs">{r.comment}</td>
                    <td className="p-2 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Card layout for mobile */}
          <div className="flex flex-col gap-4 md:hidden">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded shadow p-4">
                <div className="font-semibold text-primary mb-1">{r.productId || '-'}</div>
                <div className="text-xs text-gray-500 mb-1">{r.userId || '-'}</div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500 font-bold">{r.rating}★</span>
                  <span className="text-xs text-gray-400">{r.title || '-'}</span>
                </div>
                <div className="text-sm mb-2 whitespace-pre-line">{r.comment}</div>
                <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 