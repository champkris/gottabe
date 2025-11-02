import { Card, CardContent } from '@/components/ui/card'

interface ProductSkeletonProps {
  viewMode?: 'grid' | 'list'
}

export default function ProductSkeleton({ viewMode = 'grid' }: ProductSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden">
        <div className="flex animate-pulse">
          {/* Image Skeleton */}
          <div className="w-48 h-48 bg-gray-200 flex-shrink-0" />

          {/* Content Skeleton */}
          <CardContent className="flex-1 p-6">
            <div className="flex justify-between">
              <div className="flex-1">
                {/* Category */}
                <div className="h-3 w-32 bg-gray-200 rounded mb-2" />

                {/* Title */}
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />

                {/* Description */}
                <div className="space-y-2 mb-3">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-4/5 bg-gray-200 rounded" />
                </div>

                {/* Rating */}
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>

              <div className="ml-4">
                {/* Price */}
                <div className="h-6 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-16 bg-gray-200 rounded mb-3" />

                {/* Buttons */}
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  // Grid View (default)
  return (
    <Card className="overflow-hidden">
      <div className="animate-pulse">
        {/* Image Skeleton */}
        <div className="aspect-square bg-gray-200" />

        {/* Content Skeleton */}
        <CardContent className="p-4">
          {/* Category */}
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />

          {/* Title */}
          <div className="space-y-1 mb-3">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-4 bg-gray-200 rounded-full" />
              ))}
            </div>
            <div className="h-3 w-8 bg-gray-200 rounded" />
          </div>

          {/* Price */}
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}