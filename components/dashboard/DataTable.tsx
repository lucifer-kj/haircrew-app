'use client'

import React from 'react'

/**
 * Reusable data table component with sorting, filtering, and pagination
 */
function DataTable<T>({ 
  columns, 
  data, 
  sortBy, 
  sortDir, 
  onSort, 
  pagination, 
  filters 
}: DataTableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (onSort) {
      onSort(key)
    }
  }

  const getSortIcon = (columnKey: keyof T) => {
    if (sortBy !== columnKey) return null
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 overflow-x-auto">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Data Table
        </h2>
        {filters && (
          <div className="flex gap-2 items-center">
            {filters.status !== undefined && (
              <>
                <label className="text-sm font-medium mr-2">Status:</label>
                <select
                  value={filters.status}
                  onChange={e => filters.onStatusChange?.(e.target.value)}
                  className="rounded border px-2 py-1"
                  aria-label="Filter by status"
                >
                  <option value="">All</option>
                  {filters.statusOptions?.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <table className="min-w-full text-sm" role="table" aria-label="Data table">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-900/40">
            {columns.map((column) => (
              <th
                key={String(column.accessorKey)}
                className={`p-2 ${column.sortable ? 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800' : ''}`}
                onClick={() => column.sortable && handleSort(column.accessorKey)}
                style={{ width: column.width }}
                scope="col"
                aria-sort={sortBy === column.accessorKey ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                {column.header}
                {column.sortable && getSortIcon(column.accessorKey)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="text-center py-8 text-slate-500"
              >
                No data found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b hover:bg-primary/5 transition"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-2 whitespace-nowrap">
                    {column.cell 
                      ? column.cell({ 
                          getValue: () => row[column.accessorKey], 
                          row: { original: row } 
                        })
                      : String(row[column.accessorKey] ?? '')
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// Reimplement DataTableProps locally
export interface DataTableProps<T> {
  columns: Array<{
    header: string
    accessorKey: keyof T
    cell?: (info: { getValue: () => unknown; row: { original: T } }) => React.ReactNode
    sortable?: boolean
    width?: string
  }>
  data: T[]
  sortBy?: keyof T
  sortDir?: 'asc' | 'desc'
  onSort?: (key: keyof T) => void
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  filters?: {
    status?: string
    onStatusChange?: (status: string) => void
    statusOptions?: string[]
  }
}

export default DataTable 