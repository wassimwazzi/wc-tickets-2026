import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Pencil, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ListingGrid from '@/components/listings/ListingGrid'
import EscrowTracker from '@/components/offers/EscrowTracker'
import { OfferCard } from '@/components/offers/OfferCard'
import { useAuth } from '@/contexts/AuthContext'
import { useListings, useDeleteListing } from '@/hooks/useListings'
import { useMyOffers, useUpdateOffer } from '@/hooks/useOffers'
import { formatPrice, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { toast } from '@/components/ui/toaster'
import type { Database } from '@/lib/database.types'

type EscrowRow = Database['public']['Tables']['escrow_transactions']['Row']
type ReviewRow = Database['public']['Tables']['reviews']['Row'] & {
  reviewer?: { full_name: string | null } | null
}

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const { data: myListings = [], isLoading: listingsLoading } = useListings({
    sellerId: user?.id,
    status: undefined,
  })

  const { data: myOffers = [] } = useMyOffers(user?.id)
  const deleteListing = useDeleteListing()
  const updateOffer = useUpdateOffer()

  // Offers received on user's listings (as a seller)
  const { data: offersReceived = [] } = useQuery({
    queryKey: ['offers-received', user?.id, myListings],
    queryFn: async () => {
      if (!user || myListings.length === 0) return []
      const listingIds = myListings.map(l => l.id)
      const { data, error } = await supabase
        .from('offers')
        .select('*, listing:listings(id, section, match_id, matches(team1, team2))')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as any[]
    },
    enabled: !!user && myListings.length > 0,
  })

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async (): Promise<EscrowRow[]> => {
      if (!user) return []
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as EscrowRow[]
    },
    enabled: !!user,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.id],
    queryFn: async (): Promise<ReviewRow[]> => {
      if (!user) return []
      const { data, error } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviewer_id(*)')
        .eq('reviewee_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as ReviewRow[]
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please sign in to view your profile.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    )
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8 p-6 bg-white rounded-xl border">
        <Avatar size="lg">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ''} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile?.full_name ?? 'My Account'}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          {profile?.reputation_score !== null && profile?.reputation_score !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(profile.reputation_score)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm font-medium ml-1">{Number(profile.reputation_score).toFixed(1)}</span>
              {profile.total_reviews ? <span className="text-sm text-gray-500">({profile.total_reviews} reviews)</span> : null}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">My Listings ({myListings.length})</TabsTrigger>
          <TabsTrigger value="offers-received">Offers Received ({offersReceived.length})</TabsTrigger>
          <TabsTrigger value="offers-sent">Offers Sent ({myOffers.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Your Listings</h2>
            <Button size="sm" onClick={() => navigate('/sell')} style={{ backgroundColor: '#E30613', color: 'white' }}>
              + New Listing
            </Button>
          </div>
          <ListingGrid listings={myListings as Parameters<typeof ListingGrid>[0]['listings']} isLoading={listingsLoading} />
          {myListings.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map(listing => (
                <div key={listing.id} className="flex justify-end gap-2 -mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300"
                    aria-label="Delete listing"
                    disabled={deleteListing.isPending}
                    onClick={async () => {
                      try {
                        await deleteListing.mutateAsync(listing.id)
                        toast({ title: 'Listing deleted' })
                      } catch {
                        toast({ title: 'Failed to delete listing', description: 'Please try again.', variant: 'destructive' })
                      }
                    }}
                  >
                    {deleteListing.isPending ? (
                      <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="offers-received" className="mt-6">
          <h2 className="font-semibold mb-4">Offers Received on Your Listings</h2>
          {offersReceived.length === 0 ? (
            <p className="text-slate-500">No offers received yet on your listings.</p>
          ) : (
            <div className="space-y-3">
              {offersReceived.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  role="seller"
                  isPending={updateOffer.isPending}
                  onAccept={() =>
                    updateOffer.mutate(
                      { id: offer.id, status: 'accepted' },
                      { onSuccess: () => toast({ title: 'Offer accepted! 🎉' }) }
                    )
                  }
                  onDecline={() =>
                    updateOffer.mutate(
                      { id: offer.id, status: 'declined' },
                      { onSuccess: () => toast({ title: 'Offer declined' }) }
                    )
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="offers-sent" className="mt-6">
          <h2 className="font-semibold mb-4">Offers You've Made</h2>
          {myOffers.length === 0 ? (
            <p className="text-slate-500">You haven't made any offers yet.</p>
          ) : (
            <div className="space-y-3">
              {myOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  role="buyer"
                  isPending={updateOffer.isPending}
                  onWithdraw={() =>
                    updateOffer.mutate(
                      { id: offer.id, status: 'withdrawn' },
                      { onSuccess: () => toast({ title: 'Offer withdrawn' }) }
                    )
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <h2 className="font-semibold mb-4">Your Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <div className="space-y-6">
              {transactions.map(tx => (
                <Card key={tx.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between mb-3">
                      <p className="font-semibold">{formatPrice(tx.amount, tx.currency)}</p>
                      <span className="text-xs text-gray-500">{tx.created_at ? formatDate(tx.created_at) : ''}</span>
                    </div>
                    <EscrowTracker transaction={tx} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <h2 className="font-semibold mb-4">Reviews Received</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const reviewer = review.reviewer
                return (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="font-medium">{review.rating}/5</span>
                      </div>
                      {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        By {reviewer?.full_name ?? 'Anonymous'} · {review.created_at ? formatDate(review.created_at) : ''}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
