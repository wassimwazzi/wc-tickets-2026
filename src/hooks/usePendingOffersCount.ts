import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export interface NotificationItem {
  offerId: string
  listingId: string
  type: 'pending_offer' | 'countered'
}

interface PendingOffersResult {
  count: number
  items: NotificationItem[]
}

/**
 * Returns count + actionable notification items for the nav bell:
 * - Seller: pending offers on their listings → link to listing page
 * - Buyer: countered offers → link to listing page
 */
export function usePendingOffersCount(userId?: string): PendingOffersResult {
  const [result, setResult] = useState<PendingOffersResult>({ count: 0, items: [] })
  const listingIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!userId) { setResult({ count: 0, items: [] }); return }

    const fetchCount = async () => {
      // Seller side: listings they own
      const { data: listingsData } = await supabase
        .from('listings')
        .select('id')
        .eq('seller_id', userId)
      listingIdsRef.current = (listingsData ?? []).map(l => l.id)

      const items: NotificationItem[] = []

      if (listingIdsRef.current.length > 0) {
        const { data: pendingOffers } = await supabase
          .from('offers')
          .select('id, listing_id')
          .in('listing_id', listingIdsRef.current)
          .eq('status', 'pending')
        for (const o of pendingOffers ?? []) {
          items.push({ offerId: o.id, listingId: o.listing_id, type: 'pending_offer' })
        }
      }

      // Buyer side: their countered offers
      const { data: counteredOffers } = await supabase
        .from('offers')
        .select('id, listing_id')
        .eq('buyer_id', userId)
        .eq('status', 'countered')
      for (const o of counteredOffers ?? []) {
        items.push({ offerId: o.id, listingId: o.listing_id, type: 'countered' })
      }

      setResult({ count: items.length, items })
    }

    fetchCount()

    const channel = supabase
      .channel(`pending-offers-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, fetchCount)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return result
}
