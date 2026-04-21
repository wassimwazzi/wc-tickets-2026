import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Menu, User, LogOut, ListChecks, Home, Ticket } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Header() {
  const { user, profile, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { to: '/browse', label: 'Browse Tickets', icon: <Ticket className="w-4 h-4" /> },
    { to: '/sell', label: 'Sell Tickets', icon: <ListChecks className="w-4 h-4" /> },
  ]

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 shadow-sm" style={{ borderBottomColor: '#E30613' }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Trophy className="w-7 h-7" style={{ color: '#E30613' }} />
          <span style={{ fontFamily: "'Russo One', sans-serif", color: '#0033A0' }}>
            WC Tickets <span style={{ color: '#E30613' }}>2026</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Avatar>
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ''} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
                <User className="w-4 h-4" />
                Profile
              </Link>
              <button
                onClick={() => signOut().then(() => navigate('/'))}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#E30613' }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-red-600" />
                  WC Tickets 2026
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 py-2 border-b"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-gray-700 py-2"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        className="flex items-center gap-2 text-gray-700 py-2"
                        onClick={() => { signOut(); setMobileOpen(false) }}
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-full py-2 px-4 rounded-lg text-white font-medium"
                      style={{ backgroundColor: '#E30613' }}
                      onClick={() => { signInWithGoogle(); setMobileOpen(false) }}
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
  )
}
