import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Handle both PKCE (?code=) and implicit hash fragment (#access_token=) flows
    const hash = window.location.hash
    const search = window.location.search

    if (search.includes('code=')) {
      // PKCE flow (OAuth providers)
      supabase.auth.exchangeCodeForSession(search)
        .then(() => navigate('/'))
        .catch(() => navigate('/'))
    } else if (hash.includes('access_token=')) {
      // Implicit flow (magic link / email OTP) — Supabase client auto-parses hash
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          subscription.unsubscribe()
          navigate('/')
        }
      })
      // Safety fallback: if already signed in before listener fires
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate('/')
      })
    } else {
      navigate('/')
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  )
}
