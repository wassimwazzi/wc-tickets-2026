import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Calendar, Tag, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatPrice, formatDate, getCountryFlag, CATEGORY_LABELS, CATEGORY_COLORS, cn } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  match?: Database['public']['Tables']['matches']['Row'] | null
  seller?: Database['public']['Tables']['profiles']['Row'] | null
}

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-gray-100 text-gray-500',
}

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { match, seller } = listing

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
      <Link to={`/listings/${listing.id}`}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
          {/* Match header */}
          {match && (
            <div className="px-4 pt-4 pb-2 border-b bg-gradient-to-r from-blue-50 to-red-50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  <span>{getCountryFlag(match.team1_code)}</span>
                  <span>{match.team1 ?? 'TBD'}</span>
                  <span className="text-gray-400 text-xs">vs</span>
                  <span>{match.team2 ?? 'TBD'}</span>
                  <span>{getCountryFlag(match.team2_code)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[listing.status ?? 'available']}`}>
                  {listing.status ?? 'available'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {match.city}
                </span>
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(match.match_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <CardContent className="pt-3 pb-4 space-y-3">
            {/* Category badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', CATEGORY_COLORS[listing.category])}>
                {CATEGORY_LABELS[listing.category]}
              </span>
            </div>

            {/* Seat details */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span><Tag className="w-3.5 h-3.5 inline mr-0.5" />Section {listing.section}</span>
              <span>Row {listing.row_label}</span>
              <span>Seat {listing.seat_number}</span>
            </div>

            {/* Quantity */}
            {listing.quantity && listing.quantity > 1 && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {listing.quantity} tickets
              </div>
            )}

            {/* Price */}
            <div className="text-2xl font-bold" style={{ color: '#E30613' }}>
              {formatPrice(listing.price, listing.currency ?? 'USD')}
            </div>

            {/* Seller */}
            {seller && (
              <div className="flex items-center gap-2 pt-1 border-t">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                  {seller.full_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-xs text-gray-600">{seller.full_name ?? 'Anonymous'}</span>
                {seller.reputation_score !== null && (
                  <span className="flex items-center gap-0.5 text-xs text-yellow-600 ml-auto">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {Number(seller.reputation_score).toFixed(1)}
                    {seller.total_reviews ? ` (${seller.total_reviews})` : ''}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
