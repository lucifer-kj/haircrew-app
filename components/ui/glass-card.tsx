'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  highlight?: boolean
  gradient?: boolean
  gradientColors?: string
  onClick?: () => void
}

/**
 * GlassCard - A component that applies Apple-style liquid glass UI effects
 */
export function GlassCard({
  children,
  className,
  interactive = true,
  highlight = false,
  gradient = false,
  gradientColors = 'from-primary/20 to-secondary/20',
  onClick,
}: GlassCardProps) {
  const baseClasses = cn(
    'relative overflow-hidden rounded-2xl p-6 shadow-lg',
    'backdrop-blur-md border border-white/10',
    highlight && 'glass-card-highlight',
    gradient
      ? `bg-gradient-to-br ${gradientColors}`
      : 'bg-gradient-to-br from-white/10 to-white/5',
    className
  )

  if (!interactive) {
    return (
      <div className={baseClasses} onClick={onClick}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={baseClasses}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

interface GlassButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

/**
 * GlassButton - A button with glass morphism effect
 */
export function GlassButton({
  children,
  className,
  onClick,
  disabled = false,
  type = 'button',
}: GlassButtonProps) {
  return (
    <motion.button
      className={cn(
        'px-4 py-2 rounded-full',
        'bg-white/20 backdrop-blur-md',
        'border border-white/20 shadow-sm',
        'text-sm font-medium',
        'hover:bg-white/30 transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  )
}

interface GlassBadgeProps {
  children: React.ReactNode
  className?: string
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'primary'
    | 'secondary'
}

/**
 * GlassBadge - A badge with glass morphism effect
 */
export function GlassBadge({
  children,
  className,
  variant = 'default',
}: GlassBadgeProps) {
  const variantClasses = {
    default: 'bg-slate-500/80 text-white',
    success: 'bg-emerald-500/80 text-white',
    warning: 'bg-amber-500/80 text-white',
    danger: 'bg-rose-500/80 text-white',
    info: 'bg-blue-500/80 text-white',
    primary: 'bg-primary/80 text-white',
    secondary: 'bg-secondary/80 text-white',
  }

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
}

/**
 * GlassPanel - A semi-transparent panel with glass effect for backgrounds
 */
export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl',
        className
      )}
    >
      {children}
    </div>
  )
}
