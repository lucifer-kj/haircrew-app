import { ColumnDef, Row } from '@tanstack/react-table'
import { AdminOrderTableRow } from '@/types/dashboard'
import React from 'react'

export const adminOrderColumns: ColumnDef<AdminOrderTableRow>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }: { row: Row<AdminOrderTableRow> }) => (
      <span className="font-medium">
        #{String(row.getValue('id')).slice(0, 6)}...
      </span>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }: { row: Row<AdminOrderTableRow> }) => (
      <div className="truncate max-w-[120px]">
        {row.getValue('customer')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<AdminOrderTableRow> }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.getValue('status') === 'completed'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {row.getValue('status')}
      </span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }: { row: Row<AdminOrderTableRow> }) => (
      <span>${row.getValue('amount')}</span>
    ),
  },
] 