"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
];

// Categories for dynamic prefetching
const CATEGORIES = ['shampoo', 'conditioner', 'treatment', 'styling', 'accessories'];

// Type for NetworkInformation API
interface NetworkInformation extends Navigator {
  connection?: {
    saveData: boolean;
    effectiveType: string;
  };
}

export function RoutePrefetcher() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Don't prefetch on low-end devices or with reduced data preference
    if (
      'connection' in navigator && 
      (navigator as NetworkInformation).connection?.saveData
    ) {
      return;
    }
    
    // Check if we're on a mobile device with potentially slow connection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Prefetch static routes
    const routesToPrefetch = isMobile ? IMPORTANT_ROUTES.slice(0, 5) : IMPORTANT_ROUTES;
    
    // Use idle callback for non-critical prefetching
    const prefetchRoutes = () => {
      routesToPrefetch.forEach(route => {
        if (route !== pathname) {
          router.prefetch(route);
        }
      });
    };
    
    // Check if requestIdleCallback is available
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      // Use TypeScript type assertion for requestIdleCallback
      (window.requestIdleCallback || setTimeout)(prefetchRoutes);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(prefetchRoutes, 200);
    }
    
    // Prefetch category routes dynamically
    if (pathname === '/categories' || pathname === '/products') {
      CATEGORIES.forEach(category => {
        router.prefetch(`/categories/${category}`);
      });
    }
  }, [router, pathname]);

  // This component doesn't render anything
  return null;
}

export default RoutePrefetcher; 