'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Routes that should be prefetched for optimal performance
const IMPORTANT_ROUTES = [
  '/products',
  '/categories',
  '/cart',
  '/dashboard/profile',
  '/dashboard/orders',
  '/dashboard/wishlist',
  '/categories/shampoo',
  '/categories/conditioner',
  '/categories/treatment',
  '/about',
  '/contact',
]

// Categories for dynamic prefetching
const CATEGORIES = [
  'shampoo',
  'conditioner',
  'treatment',
  'styling',
  'accessories',
]

// Type for NetworkInformation API
interface NetworkInformation extends Navigator {
  connection?: {
    saveData: boolean
    effectiveType: string
  }
}

export function RoutePrefetcher() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Network-aware prefetching
    const connection = (navigator as NetworkInformation).connection;
    const saveData = connection?.saveData;
    const effectiveType = connection?.effectiveType;
    const isSlow = effectiveType && ['2g', '3g'].includes(effectiveType);
    const isOffline = !navigator.onLine;
    if (saveData || isSlow || isOffline) {
      // Don't prefetch on slow, metered, or offline connections
      return;
    }

    // Prefetch batching and throttling
    const BATCH_SIZE = 3;
    const BATCH_DELAY = 500; // ms between batches
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const routesToPrefetch = isMobile ? IMPORTANT_ROUTES.slice(0, 5) : IMPORTANT_ROUTES;

    let batchIndex = 0;
    function batchPrefetch() {
      const batch = routesToPrefetch.slice(batchIndex, batchIndex + BATCH_SIZE);
      batch.forEach(route => {
        if (route !== pathname) {
          router.prefetch(route);
        }
      });
      batchIndex += BATCH_SIZE;
      if (batchIndex < routesToPrefetch.length) {
        setTimeout(batchPrefetch, BATCH_DELAY);
      }
    }

    // Use idle callback for non-critical prefetching
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window.requestIdleCallback || setTimeout)(batchPrefetch);
    } else {
      setTimeout(batchPrefetch, 200);
    }

    // Prefetch category routes dynamically, batched
    if (pathname === '/categories' || pathname === '/products') {
      let catIndex = 0;
      function batchCategoryPrefetch() {
        const batch = CATEGORIES.slice(catIndex, catIndex + BATCH_SIZE);
        batch.forEach(category => {
          router.prefetch(`/categories/${category}`);
        });
        catIndex += BATCH_SIZE;
        if (catIndex < CATEGORIES.length) {
          setTimeout(batchCategoryPrefetch, BATCH_DELAY);
        }
      }
      batchCategoryPrefetch();
    }
  }, [router, pathname]);

  // This component doesn't render anything
  return null
}

export default RoutePrefetcher
