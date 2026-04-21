import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import ListingCard from './ListingCard'
import { Ticket } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type ListingRow = Database['public']['Tables']['listings']['Row'] & {
  match?: Database['public']['Tables']['matches']['Row'] | null
  seller?: Database['public']['Tables']['profiles']['Row'] | null
}

interface ListingGridProps {
  listings: ListingRow[]
  isLoading?: boolean
  loading?: boolean
  emptyMessage?: string
}

function ListingSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  )
}

export default function ListingGrid({ listings, isLoading, loading, emptyMessage }: ListingGridProps) {
  const showLoading = isLoading || loading
  if (showLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Ticket className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-lg font-medium">No listings found</p>
        <p className="text-sm mt-1">{emptyMessage ?? 'Try adjusting your filters or check back later'}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

export { ListingGrid as NamedListingGrid }

