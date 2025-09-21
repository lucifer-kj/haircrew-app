'use client'

import { useEffect } from 'react'
import { initWebVitals, initGoogleAnalytics } from '@/lib/web-vitals'

export function WebVitalsProvider() {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals()

    // Initialize Google Analytics (replace with your measurement ID)
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (measurementId) {
      initGoogleAnalytics(measurementId)
    }
  }, [])

  return null
}
