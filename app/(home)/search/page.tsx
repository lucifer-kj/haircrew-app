'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchBar from '@/components/ui/search-bar'

function SearchPageInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  // Placeholder: implement real search logic as needed
  return (
    <div className="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-center">Search</h1>
      <SearchBar initialQuery={query} className="mb-6" />
      {/* Placeholder for recent searches or results */}
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
        {/* Show results for query if present, else show prompt */}
        {query ? (
          <p className="text-center">Showing results for: <strong>{query}</strong></p>
        ) : (
          <>
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            <p className="text-center">Start typing to search for products.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
