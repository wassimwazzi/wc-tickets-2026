import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Trophy, Menu, User, LogOut, ListChecks, Home, Ticket } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
import { usePendingOffersCount } from '@/hooks/usePendingOffersCount'
import { useState, useEffect } from 'react'
import { LoginModal } from '@/components/auth/LoginModal'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const pendingOffers = usePendingOffersCount(user?.id)

  useEffect(() => {
    if (searchParams.get('openlogin') === '1') {
      setLoginOpen(true)
      setSearchParams(p => { p.delete('openlogin'); return p }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { to: '/browse', label: 'Browse Tickets', icon: <Ticket className="w-4 h-4" /> },
    { to: '/sell', label: 'Sell Tickets', icon: <ListChecks className="w-4 h-4" /> },
  ]

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FDE8EA' }}>
              <Trophy className="w-5 h-5" style={{ color: '#E30613' }} />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: '"Noto Serif Display", Georgia, serif', color: '#0033A0' }}>
              WC Tickets <span style={{ color: '#E30613' }}>2026</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="relative">
                  <Avatar className="w-9 h-9 border-2 border-slate-100">
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ''} />}
                    <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-50 to-rose-50 text-slate-700">{initials}</AvatarFallback>
                  </Avatar>
                  {pendingOffers > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {pendingOffers > 9 ? '9+' : pendingOffers}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="relative text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Profile
                  {pendingOffers > 0 && (
                    <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {pendingOffers > 9 ? '9+' : pendingOffers}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => signOut().then(() => navigate('/'))}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                style={{ backgroundColor: '#0033A0' }}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FDE8EA' }}>
                      <Trophy className="w-4 h-4" style={{ color: '#E30613' }} />
                    </div>
                    <span style={{ fontFamily: '"Noto Serif Display", Georgia, serif' }}>WC Tickets 2026</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 py-3 px-3 rounded-xl transition-colors font-medium"
                    >
                      <span className="text-slate-400">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-slate-100 mt-2">
                    {user ? (
                      <div className="flex flex-col gap-1">
                        <Link
                          to="/profile"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 py-3 px-3 rounded-xl transition-colors font-medium"
                        >
                          <User className="w-4 h-4 text-slate-400" /> Profile
                        </Link>
                        <button
                          className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 py-3 px-3 rounded-xl transition-colors font-medium"
                          onClick={() => { signOut(); setMobileOpen(false) }}
                        >
                          <LogOut className="w-4 h-4 text-slate-400" /> Sign Out
                        </button>
                      </div>
                    ) : (
                      <button
                        className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm"
                        style={{ backgroundColor: '#0033A0' }}
                        onClick={() => { setLoginOpen(true); setMobileOpen(false) }}
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  )
}
