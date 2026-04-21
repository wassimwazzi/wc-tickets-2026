export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string
          match_number: number
          team1: string | null
          team2: string | null
          team1_code: string | null
          team2_code: string | null
          venue: string
          city: string
          country: string
          stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL'
          group_name: string | null
          match_date: string
          created_at: string
        }
        Insert: {
          id?: string
          match_number: number
          team1?: string | null
          team2?: string | null
          team1_code?: string | null
          team2_code?: string | null
          venue: string
          city: string
          country: string
          stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL'
          group_name?: string | null
          match_date: string
          created_at?: string | null
        }
        Update: {
          id?: string
          match_number?: number
          team1?: string | null
          team2?: string | null
          team1_code?: string | null
          team2_code?: string | null
          venue?: string
          city?: string
          country?: string
          stage?: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL'
          group_name?: string | null
          match_date?: string
          created_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          contact_preference: 'whatsapp' | 'facebook' | 'email' | 'instagram' | null
          contact_info: string | null
          reputation_score: number | null
          total_reviews: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          contact_preference?: 'whatsapp' | 'facebook' | 'email' | 'instagram' | null
          contact_info?: string | null
          reputation_score?: number | null
          total_reviews?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          contact_preference?: 'whatsapp' | 'facebook' | 'email' | 'instagram' | null
          contact_info?: string | null
          reputation_score?: number | null
          total_reviews?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          match_id: string
          section: string
          row_label: string
          seat_number: string
          quantity: number
          min_sell_quantity: number
          category: number
          price: number | null
          currency: string
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          seller_id: string
          match_id: string
          section: string
          row_label: string
          seat_number: string
          quantity?: number
          min_sell_quantity?: number
          category: number
          price?: number | null
          currency?: string
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          seller_id?: string
          match_id?: string
          section?: string
          row_label?: string
          seat_number?: string
          quantity?: number
          min_sell_quantity?: number
          category?: number
          price?: number | null
          currency?: string
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string
          amount: number
          currency: string
          quantity: number
          status: string | null
          message: string | null
          counteroffer_amount: number | null
          counteroffer_message: string | null
          buyer_read_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id: string
          amount: number
          currency: string
          quantity?: number
          status?: string | null
          message?: string | null
          counteroffer_amount?: number | null
          counteroffer_message?: string | null
          buyer_read_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string
          buyer_id?: string
          amount?: number
          currency?: string
          quantity?: number
          status?: string | null
          message?: string | null
          counteroffer_amount?: number | null
          counteroffer_message?: string | null
          buyer_read_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          id: string
          offer_id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          amount: number
          currency: string
          status: string | null
          buyer_confirmed_at: string | null
          seller_confirmed_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          offer_id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          amount: number
          currency: string
          status?: string | null
          buyer_confirmed_at?: string | null
          seller_confirmed_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          offer_id?: string
          listing_id?: string
          buyer_id?: string
          seller_id?: string
          amount?: number
          currency?: string
          status?: string | null
          buyer_confirmed_at?: string | null
          seller_confirmed_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          transaction_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          transaction_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          transaction_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type Match = Database['public']['Tables']['matches']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Offer = Database['public']['Tables']['offers']['Row']
export type EscrowTransaction = Database['public']['Tables']['escrow_transactions']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
