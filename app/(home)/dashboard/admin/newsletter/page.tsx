'use client'
import { NewsletterSignup } from '@prisma/client' 
import { useEffect, useState } from 'react'

export default function AdminNewsletterPage() {
  const [signups, setSignups] = useState<NewsletterSignup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then(res => res.json())
      .then(data => setSignups(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load newsletter signups.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Newsletter Signups</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : signups.length === 0 ? (
        <div>No newsletter signups found.</div>
      ) : (
        <>
          {/* Table for md+ */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2">Email</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {signups.map(s => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2 whitespace-nowrap">{s.email}</td>
                    <td className="p-2 whitespace-nowrap">{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Card layout for mobile */}
          <div className="flex flex-col gap-4 md:hidden">
            {signups.map(s => (
              <div key={s.id} className="bg-white rounded shadow p-4">
                <div className="font-semibold text-primary mb-1">{s.email}</div>
                <div className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 