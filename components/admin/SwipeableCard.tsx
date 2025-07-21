'use client'
import { useSwipeable } from 'react-swipeable'
import React from 'react'

export function SwipeableCard({ children }: { children: React.ReactNode }) {
  const handlers = useSwipeable({
    onSwipedLeft: () => console.log('Swiped left'),
    onSwipedRight: () => console.log('Swiped right'),
    trackMouse: true,
  })

  return (
    <div {...handlers} className="touch-pan-y select-none">
      {children}
    </div>
  )
} 