import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Phone, Mail, ExternalLink, Tag, Users, ArrowLeft, Check, MapPinIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import MatchBadge from '@/components/matches/MatchBadge'
import OfferModal from '@/components/offers/OfferModal'
import { OfferCard } from '@/components/offers/OfferCard'
import { useListing } from '@/hooks/useListings'
import { useOffers, useUpdateOffer, useCounterOffer } from '@/hooks/useOffers'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice, formatDate, CATEGORY_LABELS, CATEGORY_COLORS, cn } from '@/lib/utils'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: listing, isLoading } = useListing(id)
  const { user } = useAuth()
  const [offerOpen, setOfferOpen] = useState(false)
  const { data: offers = [] } = useOffers(id)
  const updateOffer = useUpdateOffer()
  const counterOffer = useCounterOffer()

  const isSeller = user?.id === listing?.seller_id
  const isAuthenticated = !!user

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Listing not found.</p>
        <Link to="/browse"><Button className="mt-4">Browse Listings</Button></Link>
      </div>
    )
  }

  const { match, seller } = listing as typeof listing & {
    match?: { id: string; match_number: number; team1: string | null; team2: string | null; team1_code: string | null; team2_code: string | null; venue: string; city: string; country: string; stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL'; group_name: string | null; match_date: string; created_at: string | null } | null
    seller?: { id: string; full_name: string | null; avatar_url: string | null; contact_preference: string | null; contact_info: string | null; reputation_score: number | null; total_reviews: number | null; created_at: string | null; updated_at: string | null } | null
  }

  const getContactLink = () => {
    if (!seller?.contact_info) return null
    const info = seller.contact_info
    switch (seller.contact_preference) {
      case 'whatsapp': return `https://wa.me/${info.replace(/\D/g, '')}`
      case 'email': return `mailto:${info}`
      case 'instagram': return `https://instagram.com/${info}`
      case 'facebook': return `https://facebook.com/${info}`
      default: return null
    }
  }

  const contactLink = getContactLink()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <Link to="/browse" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Browse
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Main info */}
          <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Match card - Hero style */}
            {match && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <MatchBadge match={match} />
              </div>
            )}

            {/* Ticket details */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg text-slate-900">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex flex-wrap gap-2">
                  <span className={cn('text-xs font-bold px-3 py-2 rounded-full border', CATEGORY_COLORS[listing.category])}>
                    {CATEGORY_LABELS[listing.category]}
                  </span>
                  {listing.quantity && listing.quantity > 1 && (
                    <span className="text-xs font-bold px-3 py-2 rounded-full bg-green-100 border border-green-300 text-green-700 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {listing.quantity} tickets
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-600 mb-2">SECTION</p>
                    <p className="text-2xl font-bold text-slate-900">{listing.section}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-600 mb-2">ROW</p>
                    <p className="text-2xl font-bold text-slate-900">{listing.row_label}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-600 mb-2">SEAT</p>
                    <p className="text-2xl font-bold text-slate-900">{listing.seat_number}</p>
                  </div>
                </div>

                {listing.notes && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
                    <p className="font-semibold text-sm text-amber-900 mb-1">📝 Seller's Notes</p>
                    <p className="text-sm text-amber-800">{listing.notes}</p>
                  </div>
                )}

                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  Listed {listing.created_at ? formatDate(listing.created_at) : 'recently'}
                </div>
              </CardContent>
            </Card>

            {/* Seller offers view */}
            {isSeller && offers.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="border-b border-green-100">
                  <CardTitle className="text-lg text-green-900">
                    Offers Received ({offers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {offers.map((offer: typeof offers[0]) => (
                    <OfferCard
                      key={offer.id}
                      offer={{ ...offer, listing: listing ? { id: listing.id, section: listing.section } : undefined }}
                      role="seller"
                      isPending={updateOffer.isPending || counterOffer.isPending}
                      onAccept={() => updateOffer.mutate({ id: offer.id, status: 'accepted' })}
                      onDecline={() => updateOffer.mutate({ id: offer.id, status: 'declined' })}
                      onCounter={(amount, message) =>
                        counterOffer.mutate({ id: offer.id, counteroffer_amount: amount, counteroffer_message: message })
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right - Price & actions */}
          <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            {/* Price card - Hero */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-orange-600 mb-2">ASKING PRICE</p>
                  <p className="text-5xl font-black text-orange-600">
                    {formatPrice(listing.price, listing.currency ?? 'USD')}
                  </p>
                </div>

                {!isSeller && isAuthenticated && listing.status === 'available' && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="w-full text-base font-bold h-12"
                      style={{ backgroundColor: '#F97316', color: 'white' }}
                      onClick={() => setOfferOpen(true)}
                    >
                      💰 Make an Offer
                    </Button>
                  </motion.div>
                )}

                {!isAuthenticated && (
                  <div className="text-center text-sm bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                    <Link to="/" className="text-blue-600 hover:text-blue-700 font-bold">Sign in</Link> to make an offer
                  </div>
                )}

                {isSeller && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 text-sm text-blue-800 font-medium">
                    ✓ This is your listing
                  </div>
                )}

                {listing.status !== 'available' && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-sm text-red-800 font-bold">
                    ⓘ This listing is {listing.status}
                  </div>
                )}

                {seller?.contact_info && contactLink && !isSeller && (
                  <a href={contactLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full font-bold border-2 hover:bg-slate-100">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Message Seller
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Seller info - Card */}
            {seller && (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-xs font-bold text-slate-500 mb-4 tracking-wide">SELLER</p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {seller.full_name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{seller.full_name ?? 'Anonymous'}</p>
                      {seller.created_at && (
                        <p className="text-xs text-slate-500">Member since {new Date(seller.created_at).getFullYear()}</p>
                      )}
                    </div>
                  </div>

                  {seller.reputation_score !== null && (
                    <div className="flex items-center gap-1 mb-4 p-3 bg-yellow-50 rounded-lg">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(Number(seller.reputation_score)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-auto font-bold text-yellow-700">{Number(seller.reputation_score).toFixed(1)}</span>
                      {seller.total_reviews && <span className="text-xs text-slate-600">({seller.total_reviews})</span>}
                    </div>
                  )}

                  <div className="text-xs text-slate-600 flex items-center gap-2 pt-3 border-t border-slate-100">
                    {seller.contact_preference === 'email' ? <Mail className="w-3.5 h-3.5 text-blue-500" /> : <Phone className="w-3.5 h-3.5 text-green-500" />}
                    <span className="font-medium">Prefers {seller.contact_preference ?? 'message'}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Offer modal */}
      {isAuthenticated && listing && <OfferModal isOpen={offerOpen} onClose={() => setOfferOpen(false)} listing={listing} />}
    </div>
  )
}
