import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type OfferInsert = Database['public']['Tables']['offers']['Insert']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOffer = any

export function useOffers(listingId?: string) {
  return useQuery({
    queryKey: ['offers', listingId],
    queryFn: async (): Promise<AnyOffer[]> => {
      if (!listingId) return []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('offers')
        .select(`*, buyer:profiles(*)`)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!listingId,
  })
}

export function useMyOffers(buyerId?: string) {
  return useQuery({
    queryKey: ['my-offers', buyerId],
    queryFn: async (): Promise<AnyOffer[]> => {
      if (!buyerId) return []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('offers')
        .select(`*, listing:listings(*, match:matches(*))`)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!buyerId,
  })
}

export function useCreateOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (offer: OfferInsert) => {
      const { data, error } = await supabase.from('offers').insert(offer as never).select().single()
      if (error) throw error
      return data as Database['public']['Tables']['offers']['Row']
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offers', variables.listing_id] })
    },
  })
}

export function useUpdateOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('offers')
        .update({ status } as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Database['public']['Tables']['offers']['Row']
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      queryClient.invalidateQueries({ queryKey: ['offers-received'] })
      queryClient.invalidateQueries({ queryKey: ['my-offers'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}

export function useCounterOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      counteroffer_amount,
      counteroffer_message,
    }: {
      id: string
      counteroffer_amount: number
      counteroffer_message?: string
    }) => {
      const { data, error } = await supabase
        .from('offers')
        .update({ status: 'countered', counteroffer_amount, counteroffer_message: counteroffer_message ?? null } as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Database['public']['Tables']['offers']['Row']
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      queryClient.invalidateQueries({ queryKey: ['offers-received'] })
      queryClient.invalidateQueries({ queryKey: ['my-offers'] })
    },
  })
}
