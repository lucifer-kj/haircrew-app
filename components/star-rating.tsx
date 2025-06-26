"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(maxRating)].map((_, i) => (
        <button
          key={i}
          type={interactive ? "button" : undefined}
          onClick={() => handleStarClick(i + 1)}
          disabled={!interactive}
          className={cn(
            "focus:outline-none transition-colors",
            interactive && "hover:scale-110",
            !interactive && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} out of {maxRating}
        </span>
      )}
    </div>
  )
} 