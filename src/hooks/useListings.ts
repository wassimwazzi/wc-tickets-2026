import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type ListingInsert = Database['public']['Tables']['listings']['Insert']
type ListingUpdate = Database['public']['Tables']['listings']['Update']

export interface ListingFilters {
  stage?: string
  matchId?: string
  category?: number
  minPrice?: number
  maxPrice?: number
  currency?: string
  status?: string
  sellerId?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyListing = any

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async (): Promise<AnyListing[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase
        .from('listings')
        .select(`
          *,
          match:matches(*),
          seller:profiles!listings_seller_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (filters?.matchId) query = query.eq('match_id', filters.matchId)
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.minPrice != null) query = query.gte('price', filters.minPrice)
      if (filters?.maxPrice != null) query = query.lte('price', filters.maxPrice)
      if (filters?.currency) query = query.eq('currency', filters.currency)
      if (filters?.status !== undefined) query = query.eq('status', filters.status)
      else query = query.eq('status', 'available')
      if (filters?.sellerId) query = query.eq('seller_id', filters.sellerId)

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
  })
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async (): Promise<AnyListing | null> => {
      if (!id) return null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('listings')
        .select(`*, match:matches(*), seller:profiles!listings_seller_id_fkey(*)`)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (listing: ListingInsert) => {
      const { data, error } = await supabase.from('listings').insert(listing as never).select().single()
      if (error) throw error
      return data as Database['public']['Tables']['listings']['Row']
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...update }: ListingUpdate & { id: string }) => {
      const { data, error } = await supabase.from('listings').update(update as never).eq('id', id).select().single()
      if (error) throw error
      return data as Database['public']['Tables']['listings']['Row']
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('listings').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  })
}
