import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Returns the count of pending offers on the user's listings.
 * Subscribes to Supabase Realtime so the badge stays live.
 */
export function usePendingOffersCount(userId?: string) {
  const [count, setCount] = useState(0)
  const listingIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!userId) { setCount(0); return }

    const fetchCount = async () => {
      // Always refresh listing IDs so newly created listings are picked up
      const { data } = await supabase
        .from('listings')
        .select('id')
        .eq('seller_id', userId)
      listingIdsRef.current = (data ?? []).map(l => l.id)

      if (listingIdsRef.current.length === 0) { setCount(0); return }

      const { count: c } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .in('listing_id', listingIdsRef.current)
        .eq('status', 'pending')
      setCount(c ?? 0)
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
