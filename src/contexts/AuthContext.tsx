import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data && !data.full_name && user?.email) {
      const email_prefix = user.email.split('@')[0]
      await supabase.from('profiles').update({ full_name: email_prefix }).eq('id', userId)
      setProfile({ ...data, full_name: email_prefix })
    } else {
      setProfile(data)
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  async function signInWithFacebook() {
    await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signInWithGoogle, signInWithFacebook, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
