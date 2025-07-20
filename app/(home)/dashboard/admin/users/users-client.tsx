'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  updatedAt: string
  image?: string | null
  // active?: boolean; // Uncomment if you have this field
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { showToast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`
      )
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
    } catch {
      showToast('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page])

  const handleRoleChange = async (id: string, newRole: string) => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      })
      if (!res.ok) throw new Error()
      showToast(`User role updated to ${newRole}`, 'success')
      setUsers(users =>
        users.map(u => (u.id === id ? { ...u, role: newRole } : u))
      )
    } catch {
      showToast('Failed to update user role', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      showToast('User deleted', 'success')
      setUsers(users => users.filter(u => u.id !== id))
    } catch {
      showToast('Failed to delete user', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Input
          type="search"
          placeholder="Search users..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={
                        user.role === 'ADMIN'
                          ? 'text-green-600 font-semibold'
                          : ''
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        actionLoading === user.id || user.role === 'ADMIN'
                      }
                      onClick={() => handleRoleChange(user.id, 'ADMIN')}
                    >
                      Promote
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        actionLoading === user.id || user.role === 'USER'
                      }
                      onClick={() => handleRoleChange(user.id, 'USER')}
                    >
                      Demote
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === user.id}
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
          Showing {users.length ? (page - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(page * pageSize, total)} of {total} users
        </span>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page * pageSize >= total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
