import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Minus, Clock, MessageSquare, Ticket, ChevronRight, ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface OfferCardProps {
  offer: {
    id: string
    amount: number | null
    currency: string | null
    status: string
    quantity?: number | null
    message?: string | null
    counteroffer_amount?: number | null
    counteroffer_message?: string | null
    created_at?: string | null
    listing_id?: string | null
    listing?: {
      id: string
      section: string
      match?: { team1: string | null; team2: string | null } | null
      matches?: { team1: string | null; team2: string | null } | null
    } | null
    buyer?: {
      full_name?: string | null
      avatar_url?: string | null
    } | null
  }
  /** seller = show accept/decline/counter; buyer = show withdraw or accept/decline counter */
  role: 'seller' | 'buyer'
  onAccept?: () => void
  onDecline?: () => void
  onWithdraw?: () => void
  onCounter?: (amount: number, message?: string) => void
  isPending?: boolean
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  pending:   { label: 'Pending',    bg: 'bg-amber-50',    text: 'text-amber-700',   Icon: Clock },
  countered: { label: 'Countered',  bg: 'bg-violet-50',   text: 'text-violet-700',  Icon: ArrowLeftRight },
  accepted:  { label: 'Accepted',   bg: 'bg-emerald-50',  text: 'text-emerald-700', Icon: Check },
  declined:  { label: 'Declined',   bg: 'bg-red-50',      text: 'text-red-600',     Icon: X    },
  withdrawn: { label: 'Withdrawn',  bg: 'bg-slate-50',    text: 'text-slate-500',   Icon: Minus },
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

export function OfferCard({ offer, role, onAccept, onDecline, onWithdraw, onCounter, isPending }: OfferCardProps) {
  const status = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending
  const StatusIcon = status.Icon
  const [showCounterForm, setShowCounterForm] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')
  const [counterMessage, setCounterMessage] = useState('')

  const matchInfo = offer.listing?.match ?? offer.listing?.matches ?? null
  const matchLabel = matchInfo
    ? `${matchInfo.team1 ?? 'TBD'} vs ${matchInfo.team2 ?? 'TBD'}`
    : null

  const buyerInitial = offer.buyer?.full_name?.[0]?.toUpperCase() ?? '?'

  const isCountered = offer.status === 'countered'
  const isPendingStatus = offer.status === 'pending'

  // Buyer sees a countered offer and can accept or decline
  const buyerSeesCounter = role === 'buyer' && isCountered

  function handleCounterSubmit() {
    const amt = parseFloat(counterAmount)
    if (!isNaN(amt) && amt > 0) {
      onCounter?.(amt, counterMessage.trim() || undefined)
      setShowCounterForm(false)
      setCounterAmount('')
      setCounterMessage('')
    }
  }

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
            <Ticket className="w-[18px] h-[18px] text-blue-600" />
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

      {/* Middle: amount + message */}
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Amount block */}
        <div className="flex-shrink-0">
          <p className="text-xs text-slate-400 mb-0.5">
            {isCountered ? 'Original offer' : 'Offer amount'}
          </p>
          <p
            className={cn('text-2xl font-bold', isCountered && 'line-through text-slate-300 text-lg')}
            style={!isCountered ? { fontFamily: '"Noto Serif Display", Georgia, serif', color: '#0033A0' } : undefined}
          >
            {offer.amount != null
              ? formatPrice(offer.amount, offer.currency ?? 'USD')
              : <span className="text-slate-400 text-base">No price</span>
            }
          </p>
          {isCountered && offer.counteroffer_amount != null && (
            <div className="mt-1">
              <p className="text-xs text-violet-500 mb-0.5">Counter offer</p>
              <p className="text-2xl font-bold" style={{ fontFamily: '"Noto Serif Display", Georgia, serif', color: '#7c3aed' }}>
                {formatPrice(offer.counteroffer_amount, offer.currency ?? 'USD')}
              </p>
            </div>
          )}
          {(offer.quantity ?? 1) > 1 && (
            <p className="text-xs text-slate-400 mt-0.5">{offer.quantity} tickets</p>
          )}
        </div>

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
          {isCountered && offer.counteroffer_message && (
            <div className="flex gap-1.5 mt-2 p-2 bg-violet-50 rounded-lg">
              <MessageSquare className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-violet-700 italic leading-relaxed line-clamp-2">"{offer.counteroffer_message}"</p>
            </div>
          )}
          <p className="text-xs text-slate-300 mt-2">{timeAgo(offer.created_at)}</p>
        </div>
      </div>

      {/* Counter form (seller) */}
      <AnimatePresence>
        {showCounterForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-slate-100 pt-4 bg-violet-50/50">
              <p className="text-xs font-semibold text-violet-700 mb-3 uppercase tracking-wide">Your counter offer</p>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Amount"
                    value={counterAmount}
                    onChange={e => setCounterAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
              </div>
              <textarea
                placeholder="Optional message to buyer…"
                value={counterMessage}
                onChange={e => setCounterMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none mb-3"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCounterForm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCounterSubmit}
                  disabled={isPending || !counterAmount}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#7c3aed' }}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {isPending ? 'Sending…' : 'Send Counter'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {(isPendingStatus || buyerSeesCounter) && !showCounterForm && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 justify-end">
          {/* Seller actions on pending offer */}
          {role === 'seller' && isPendingStatus && (
            <>
              <button
                onClick={onDecline}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                {isPending ? '…' : 'Decline'}
              </button>
              <button
                onClick={() => setShowCounterForm(true)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-all disabled:opacity-50"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Counter
              </button>
              <button
                onClick={onAccept}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: isPending ? '#86efac' : '#16a34a' }}
              >
                <Check className="w-3.5 h-3.5" />
                {isPending ? 'Saving…' : 'Accept'}
              </button>
            </>
          )}

          {/* Buyer actions on a countered offer */}
          {buyerSeesCounter && (
            <>
              <button
                onClick={onDecline}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                {isPending ? '…' : 'Decline'}
              </button>
              <button
                onClick={onAccept}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: isPending ? '#86efac' : '#16a34a' }}
              >
                <Check className="w-3.5 h-3.5" />
                {isPending ? 'Saving…' : 'Accept Counter'}
              </button>
            </>
          )}

          {/* Buyer withdraw on pending */}
          {role === 'buyer' && isPendingStatus && (
            <button
              onClick={onWithdraw}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-50"
            >
              <Minus className="w-3.5 h-3.5" />
              {isPending ? '…' : 'Withdraw'}
            </button>
          )}
        </div>
      )}

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
