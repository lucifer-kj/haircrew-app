'use client'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export function HeroSkeleton() {
  return (
    <div className="relative bg-gradient-to-r from-gray-100 flex items-center justify-center h-[520px]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 grid-rows-2 gap-6 h-[440px]">
          {/* Main Hero Card Skeleton with content placeholders */}
          <div className="relative col-span-4 lg:col-span-2 row-span-2 bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            {/* Content overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              {/* Heading placeholder */}
              <div className="h-8 mb-4 bg-gray-100/30 rounded-lg w-3/4 animate-pulse"></div>
              {/* Description placeholder */}
              <div className="h-4 mb-2 bg-gray-100/30 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 mb-6 bg-gray-100/30 rounded-lg w-2/3 animate-pulse"></div>
              {/* Button placeholder */}
              <div className="h-12 bg-gray-100/30 rounded-full w-40 animate-pulse"></div>
            </div>
          </div>

          {/* Right Side 2x2 Grid Skeletons */}
          <div className="hidden lg:grid col-span-2 row-span-2 grid-cols-2 grid-rows-2 gap-6 h-full">
            {/* Each card with content placeholder */}
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <div className="h-5 mb-2 bg-gray-100/30 rounded w-1/2 animate-pulse"></div>
                  <div className="h-3 bg-gray-100/30 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="w-full h-56 bg-gray-200 animate-pulse"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      </div>
    </div>
  )
}
