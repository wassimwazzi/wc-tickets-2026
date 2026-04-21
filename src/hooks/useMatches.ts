import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Match } from '../lib/database.types'

export function useMatches(search?: string) {
  return useQuery({
    queryKey: ['matches', search],
    queryFn: async (): Promise<Match[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase.from('matches').select('*').order('match_date', { ascending: true })
      if (search) {
        query = query.or(`team1.ilike.%${search}%,team2.ilike.%${search}%,venue.ilike.%${search}%,city.ilike.%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as Match[]
    },
  })
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: async (): Promise<Match | null> => {
      if (!id) return null
      const { data, error } = await supabase.from('matches').select('*').eq('id', id).single()
      if (error) throw error
      return data as Match
    },
    enabled: !!id,
  })
}
