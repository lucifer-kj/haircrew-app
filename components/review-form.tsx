"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import StarRating from "./star-rating"

interface ReviewFormProps {
  onSubmit: (review: { rating: number; title: string; comment: string }) => void
  isSubmitting?: boolean
}

export default function ReviewForm({ onSubmit, isSubmitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      alert("Please select a rating")
      return
    }
    if (!title.trim()) {
      alert("Please enter a review title")
      return
    }
    if (!comment.trim()) {
      alert("Please enter a review comment")
      return
    }
    
    onSubmit({ rating, title: title.trim(), comment: comment.trim() })
    
    // Reset form
    setRating(0)
    setTitle("")
    setComment("")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <CardTitle className="mb-4">Write a Review</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <StarRating
              rating={rating}
              size="lg"
              interactive={true}
              onRatingChange={setRating}
              showValue={true}
            />
          </div>

          {/* Review Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Review Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              required
            />
          </div>

          {/* Review Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Review Comment
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed thoughts about this product..."
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || !title.trim() || !comment.trim()}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 