import { motion } from 'framer-motion'
import { Check, X, Minus, Clock, MessageSquare, Ticket, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface OfferCardProps {
  offer: {
    id: string
    amount: number | null
    currency: string | null
    status: string
    message?: string | null
    created_at?: string | null
    listing_id?: string | null
    listing?: {
      id: string
      section: string
      match?: { team1: string | null; team2: string | null } | null
      // for received offers, nested as matches (from join alias)
      matches?: { team1: string | null; team2: string | null } | null
    } | null
    buyer?: {
      full_name?: string | null
      avatar_url?: string | null
    } | null
  }
  /** seller = show accept/decline; buyer = show withdraw */
  role: 'seller' | 'buyer'
  onAccept?: () => void
  onDecline?: () => void
  onWithdraw?: () => void
  isPending?: boolean
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  pending:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-700',   Icon: Clock },
  accepted:  { label: 'Accepted',  bg: 'bg-emerald-50', text: 'text-emerald-700', Icon: Check },
  declined:  { label: 'Declined',  bg: 'bg-red-50',     text: 'text-red-600',     Icon: X    },
  withdrawn: { label: 'Withdrawn', bg: 'bg-slate-50',   text: 'text-slate-500',   Icon: Minus },
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function OfferCard({ offer, role, onAccept, onDecline, onWithdraw, isPending }: OfferCardProps) {
  const status = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending
  const StatusIcon = status.Icon

  // Handle both join alias shapes (listing.match vs listing.matches)
  const matchInfo = offer.listing?.match ?? offer.listing?.matches ?? null
  const matchLabel = matchInfo
    ? `${matchInfo.team1 ?? 'TBD'} vs ${matchInfo.team2 ?? 'TBD'}`
    : null

  const buyerInitial = offer.buyer?.full_name?.[0]?.toUpperCase() ?? '?'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Top row: match + status */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-4.5 h-4.5 text-blue-600 w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0">
            {matchLabel ? (
              <p className="font-semibold text-slate-900 text-sm truncate">{matchLabel}</p>
            ) : (
              <p className="font-semibold text-slate-400 text-sm">Match TBD</p>
            )}
            {offer.listing && (
              <p className="text-xs text-slate-400 mt-0.5">
                Section {offer.listing.section}
                {offer.listing.id && (
                  <>
                    {' · '}
                    <Link
                      to={`/listings/${offer.listing.id}`}
                      className="text-blue-500 hover:underline inline-flex items-center gap-0.5"
                    >
                      View listing <ChevronRight className="w-3 h-3" />
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        <span className={cn('flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0', status.bg, status.text)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Middle: amount + message + buyer info */}
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Amount */}
        <div className="flex-shrink-0">
          <p className="text-xs text-slate-400 mb-0.5">Offer amount</p>
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: '"Noto Serif Display", Georgia, serif', color: '#0033A0' }}
          >
            {offer.amount != null
              ? formatPrice(offer.amount, offer.currency ?? 'USD')
              : <span className="text-slate-400 text-base">No price set</span>
            }
          </p>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-slate-100 mx-1" />

        {/* Message + buyer + time */}
        <div className="flex-1 min-w-0">
          {role === 'seller' && offer.buyer && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-rose-100 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                {buyerInitial}
              </div>
              <span className="text-sm font-medium text-slate-700 truncate">
                {offer.buyer.full_name ?? 'Anonymous buyer'}
              </span>
            </div>
          )}
          {offer.message ? (
            <div className="flex gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 italic leading-relaxed line-clamp-2">"{offer.message}"</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No message</p>
          )}
          <p className="text-xs text-slate-300 mt-2">{timeAgo(offer.created_at)}</p>
        </div>
      </div>

      {/* Actions */}
      {offer.status === 'pending' && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 justify-end">
          {role === 'seller' && (
            <>
              <button
                onClick={onDecline}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                {isPending ? '...' : 'Decline'}
              </button>
              <button
                onClick={onAccept}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: isPending ? '#86efac' : '#16a34a' }}
              >
                <Check className="w-3.5 h-3.5" />
                {isPending ? 'Saving...' : 'Accept'}
              </button>
            </>
          )}
          {role === 'buyer' && (
            <button
              onClick={onWithdraw}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-50"
            >
              <Minus className="w-3.5 h-3.5" />
              {isPending ? '...' : 'Withdraw'}
            </button>
          )}
        </div>
      )}

      {/* Accepted — show next steps CTA */}
      {offer.status === 'accepted' && (
        <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100">
          <p className="text-xs text-emerald-700 font-medium">
            🎉 Offer accepted — coordinate the ticket transfer to complete the sale.
          </p>
        </div>
      )}
    </motion.div>
  )
}
