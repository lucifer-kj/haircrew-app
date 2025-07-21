'use client'

import React from 'react'
import { MetricCardProps } from '@/types/dashboard'

/**
 * Displays a metric card with icon, title and value
 * @param {ReactNode} icon - The icon component to display
 * @param {string} title - The title of the metric
 * @param {number|string} value - The value to display
 * @param {string} [format] - Optional format (currency, number, percentage)
 * @param {object} [trend] - Optional trend data with value and direction
 */
const MetricCard = React.memo(({ 
  icon, 
  title, 
  value, 
  format = 'number',
  trend 
}: MetricCardProps) => {
  const formatValue = (val: number | string, fmt: string) => {
    if (typeof val === 'string') return val
    
    switch (fmt) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 2,
        }).format(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'number':
      default:
        return val.toLocaleString()
    }
  }

  return (
    <div 
      className="bg-white dark:bg-slate-800/80 rounded-xl shadow p-6 flex flex-col items-start"
      role="region"
      aria-label={`${title} metric`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-primary" aria-hidden="true">
          {icon}
        </div>
        <span className="text-lg font-semibold text-slate-700 dark:text-white">
          {title}
        </span>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {formatValue(value, format)}
      </span>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-sm">
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {trend.isPositive ? '↗' : '↘'}
          </span>
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {trend.value}%
          </span>
          <span className="text-slate-500">vs last period</span>
        </div>
      )}
    </div>
  )
})

MetricCard.displayName = 'MetricCard'

export default MetricCard 