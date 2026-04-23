import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, Star, Armchair } from 'lucide-react'
import { formatPrice, getCountryFlag, CATEGORY_LABELS, cn } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  match?: Database['public']['Tables']['matches']['Row'] | null
  seller?: Database['public']['Tables']['profiles']['Row'] | null
}

const CATEGORY_PASTELS: Record<number, { bg: string; text: string; dot: string }> = {
  1: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  2: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  3: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  4: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
}

const STAGE_COLORS: Record<string, string> = {
  GROUP: '#0033A0',
  R32: '#16a34a',
  R16: '#d97706',
  QF: '#ea580c',
  SF: '#E30613',
  '3RD': '#7c3aed',
  FINAL: '#F0A500',
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const { match, seller } = listing
  const cat = CATEGORY_PASTELS[listing.category] ?? CATEGORY_PASTELS[4]
  const stageColor = match?.stage ? (STAGE_COLORS[match.stage] ?? '#0033A0') : '#0033A0'

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -4, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/listings/${listing.id}`} className="block h-full">
        <div className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm h-full flex flex-col">
          {/* Colored header band */}
          <div
            className="px-5 py-4 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${stageColor}ee 0%, ${stageColor}99 100%)` }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />

            {/* Match info */}
            <div className="relative z-10">
              {match ? (
                <>
                  <div className="flex items-center gap-1 font-bold text-base leading-tight mb-1">
                    <span className="text-lg">{getCountryFlag(match.team1_code)}</span>
                    <span className="truncate max-w-[90px]">{match.team1 ?? 'TBD'}</span>
                    <span className="text-white/60 text-xs mx-1">vs</span>
                    <span className="truncate max-w-[90px]">{match.team2 ?? 'TBD'}</span>
                    <span className="text-lg">{getCountryFlag(match.team2_code)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/80 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.city}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </>
              ) : (
                <p className="font-bold text-base">Match TBD</p>
              )}
            </div>

            {/* Status pill */}
            <div className="absolute top-3 right-3 z-10">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-semibold',
                listing.status === 'available' ? 'bg-green-400/90 text-white' :
                listing.status === 'pending' ? 'bg-yellow-400/90 text-gray-900' :
                'bg-white/30 text-white'
              )}>
                {listing.status ?? 'available'}
              </span>
            </div>
          </div>

          {/* Dashed ticket stub separator */}
          <div className="relative flex items-center px-4">
            <div className="-ml-4 w-5 h-5 rounded-full bg-slate-50 border border-slate-100 shadow-inner" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-1" />
            <div className="-mr-4 w-5 h-5 rounded-full bg-slate-50 border border-slate-100 shadow-inner" />
          </div>

          {/* Ticket details body */}
          <div className="px-5 py-4 flex-1 flex flex-col gap-3">
            {/* Category */}
            <div className="flex items-center gap-2">
              <span className={cn('flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full', cat.bg, cat.text)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', cat.dot)} />
                {CATEGORY_LABELS[listing.category]}
              </span>
              {listing.quantity && listing.quantity > 1 && (
                <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  {listing.quantity}x
                </span>
              )}
            </div>

            {/* Seat details */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Armchair className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Section <strong className="text-slate-800">{listing.section}</strong></span>
              <span className="text-slate-300">·</span>
              <span>Row <strong className="text-slate-800">{listing.row_label}</strong></span>
              <span className="text-slate-300">·</span>
              <span>Seat <strong className="text-slate-800">{listing.seat_number}</strong></span>
            </div>

            {/* Price */}
            <div className="mt-auto pt-2 flex items-end justify-between border-t border-slate-100">
              <div className="min-h-[3.5rem] flex flex-col justify-end">
                <p className="text-xs text-slate-400 mb-0.5">Price per ticket</p>
                {listing.price != null ? (
                  <p className="text-2xl font-bold leading-tight" style={{ color: '#0033A0', fontFamily: '"Noto Serif Display", Georgia, serif' }}>
                    {formatPrice(listing.price, listing.currency ?? 'USD')}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 italic">Price on Request</p>
                )}
              </div>

              {/* Seller */}
              {seller && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-rose-100 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-100">
                    {seller.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  {seller.total_reviews && seller.total_reviews > 0 ? (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {Number(seller.reputation_score).toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No reviews yet</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
