import type { TimeFilter } from '@/types/dashboard'

export const parsePaginationParams = (searchParams: URLSearchParams) => {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10))
  )
  const filter = (searchParams.get('filter') || 'monthly') as TimeFilter
  const offset = (page - 1) * pageSize

  return { page, pageSize, filter, offset }
}

export const getDateRange = (filter: TimeFilter) => {
  const now = new Date()
  const ranges = {
    daily: { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30) },
    weekly: { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90) },
    monthly: { start: new Date(now.getFullYear(), now.getMonth() - 12, 1) },
    yearly: { start: new Date(now.getFullYear() - 5, 0, 1) },
  }
  return ranges[filter] || ranges.monthly
} 