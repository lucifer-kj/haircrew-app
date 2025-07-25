'use client'
import { useEffect, useState } from 'react' 

type ComplaintType = {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintType[]>([])  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/complaints')
      .then(res => res.json())
      .then(data => setComplaints(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load complaints.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Complaints</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : complaints.length === 0 ? (
        <div>No complaints found.</div>
      ) : (
        <>
          {/* Table for md+ */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Message</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} className="border-b">
                    <td className="p-2 whitespace-nowrap">{c.name}</td>
                    <td className="p-2 whitespace-nowrap">{c.email}</td>
                    <td className="p-2 whitespace-pre-line max-w-xs">{c.message}</td>
                    <td className="p-2 whitespace-nowrap">{new Date(c.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Card layout for mobile */}
          <div className="flex flex-col gap-4 md:hidden">
            {complaints.map(c => (
              <div key={c.id} className="bg-white rounded shadow p-4">
                <div className="font-semibold text-primary mb-1">{c.name}</div>
                <div className="text-xs text-gray-500 mb-2">{c.email}</div>
                <div className="text-sm mb-2 whitespace-pre-line">{c.message}</div>
                <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 