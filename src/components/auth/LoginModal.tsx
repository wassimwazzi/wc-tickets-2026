import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/toaster'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { signInWithGoogle, signInWithFacebook } = useAuth()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleMagicLink = async () => {
    if (!email) return
    setSending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setSending(false)
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setEmailSent(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-wc-blue text-center">Sign in to WC Tickets</DialogTitle>
          <DialogDescription className="text-center text-slate-500">
            Sign in to list tickets, make offers, and connect with buyers & sellers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          {/* OAuth buttons */}
          <Button
            onClick={() => { signInWithGoogle(); onOpenChange(false) }}
            variant="outline"
            className="w-full h-12 font-medium border-2 hover:border-wc-blue hover:bg-blue-50 transition-all"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
          <Button
            onClick={() => { signInWithFacebook(); onOpenChange(false) }}
            className="w-full h-12 font-medium bg-[#1877F2] hover:bg-[#1565d8] text-white transition-all"
          >
            <svg className="h-5 w-5 mr-3 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </Button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">or sign in with email</span>
            </div>
          </div>

          {/* Email magic link */}
          {emailSent ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">✓ Magic link sent!</p>
              <p className="text-sm text-slate-500 mt-1">Check your inbox{import.meta.env.DEV && <> (or <a href="http://localhost:54324" target="_blank" rel="noreferrer" className="underline text-wc-blue">Mailpit</a> for local dev)</>}.</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
                className="flex-1"
              />
              <Button onClick={handleMagicLink} disabled={!email || sending} style={{ backgroundColor: '#E30613', color: 'white' }}>
                {sending ? '...' : 'Send'}
              </Button>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center mt-2">
            By signing in you agree to our Terms of Service.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
