import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Phone, Mail, ExternalLink, Tag, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import MatchBadge from '@/components/matches/MatchBadge'
import OfferModal from '@/components/offers/OfferModal'
import { useListing } from '@/hooks/useListings'
import { useOffers, useUpdateOffer } from '@/hooks/useOffers'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice, formatDate, CATEGORY_LABELS, CATEGORY_COLORS, cn } from '@/lib/utils'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: listing, isLoading } = useListing(id)
  const { user } = useAuth()
  const [offerOpen, setOfferOpen] = useState(false)
  const { data: offers = [] } = useOffers(id)
  const updateOffer = useUpdateOffer()

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
    <div className="container mx-auto px-4 py-8">
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Browse
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left - Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Match card */}
          {match && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Match Details</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchBadge match={match} />
              </CardContent>
            </Card>
          )}

          {/* Ticket details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className={cn('text-sm px-3 py-1 rounded border font-medium', CATEGORY_COLORS[listing.category])}>
                  {CATEGORY_LABELS[listing.category]}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Section</p>
                  <p className="font-semibold mt-0.5">{listing.section}</p>
                </div>
                <div>
                  <p className="text-gray-500">Row</p>
                  <p className="font-semibold mt-0.5">{listing.row_label}</p>
                </div>
                <div>
                  <p className="text-gray-500">Seat</p>
                  <p className="font-semibold mt-0.5">{listing.seat_number}</p>
                </div>
              </div>
              {listing.quantity && listing.quantity > 1 && (
                <div className="text-sm flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  {listing.quantity} tickets available
                </div>
              )}
              {listing.notes && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  <p className="font-medium mb-1">Notes from seller:</p>
                  <p>{listing.notes}</p>
                </div>
              )}
              <div className="text-xs text-gray-400">
                Listed {listing.created_at ? formatDate(listing.created_at) : ''}
              </div>
            </CardContent>
          </Card>

          {/* Seller offers view */}
          {isSeller && offers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Offers Received ({offers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {offers.map((offer: typeof offers[0]) => (
                  <div key={offer.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{formatPrice(offer.amount, offer.currency)}</p>
                      {offer.message && <p className="text-sm text-gray-600 mt-0.5">{offer.message}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Status: <span className="font-medium">{offer.status}</span>
                      </p>
                    </div>
                    {offer.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateOffer.mutate({ id: offer.id, status: 'accepted' })}
                          style={{ backgroundColor: '#16a34a', color: 'white' }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300"
                          onClick={() => updateOffer.mutate({ id: offer.id, status: 'declined' })}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Price & actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Asking Price</p>
                <p className="text-4xl font-bold" style={{ color: '#E30613' }}>
                  {formatPrice(listing.price, listing.currency ?? 'USD')}
                </p>
              </div>

              {!isSeller && isAuthenticated && listing.status === 'available' && (
                <Button
                  className="w-full text-base"
                  style={{ backgroundColor: '#E30613', color: 'white' }}
                  onClick={() => setOfferOpen(true)}
                >
                  Make Offer
                </Button>
              )}

              {!isAuthenticated && (
                <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  <Link to="/" className="text-blue-600 hover:underline font-medium">Sign in</Link> to make an offer
                </div>
              )}

              {seller?.contact_info && contactLink && !isSeller && (
                <a href={contactLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact Seller via {seller.contact_preference}
                  </Button>
                </a>
              )}

              {isSeller && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  This is your listing. View offers above.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller info */}
          {seller && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3 text-sm text-gray-500">SELLER</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {seller.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="font-semibold">{seller.full_name ?? 'Anonymous'}</p>
                    {seller.created_at && (
                      <p className="text-xs text-gray-500">Member since {new Date(seller.created_at).getFullYear()}</p>
                    )}
                  </div>
                </div>
                {seller.reputation_score !== null && (
                  <div className="flex items-center gap-1 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(Number(seller.reputation_score)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-1 font-medium">{Number(seller.reputation_score).toFixed(1)}</span>
                    {seller.total_reviews ? <span className="text-gray-500">({seller.total_reviews} reviews)</span> : null}
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                  {seller.contact_preference === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                  Prefers contact via {seller.contact_preference ?? 'message'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {listing && (
        <OfferModal
          listing={listing as Parameters<typeof OfferModal>[0]['listing']}
          isOpen={offerOpen}
          onClose={() => setOfferOpen(false)}
        />
      )}
    </div>
  )
}
