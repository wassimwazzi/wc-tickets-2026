import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Returns total notification count for the nav bell:
 * - Seller: pending offers on their listings
 * - Buyer: countered offers (seller sent a counter) that haven't been actioned
 */
export function usePendingOffersCount(userId?: string) {
  const [count, setCount] = useState(0)
  const listingIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!userId) { setCount(0); return }

    const fetchCount = async () => {
      // Seller side: pending offers on their listings
      const { data } = await supabase
        .from('listings')
        .select('id')
        .eq('seller_id', userId)
      listingIdsRef.current = (data ?? []).map(l => l.id)

      let sellerCount = 0
      if (listingIdsRef.current.length > 0) {
        const { count: c } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', listingIdsRef.current)
          .eq('status', 'pending')
        sellerCount = c ?? 0
      }

      // Buyer side: their offers that have been countered (need buyer action)
      const { count: buyerCount } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', userId)
        .eq('status', 'countered')

      setCount(sellerCount + (buyerCount ?? 0))
    }

    fetchCount()

    const channel = supabase
      .channel(`pending-offers-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
        fetchCount()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return count
}
