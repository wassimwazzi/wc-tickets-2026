import { Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FDE8EA' }}>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <span style={{ fontFamily: '"Noto Serif Display", Georgia, serif', fontSize: '1.1rem' }}>
                WC Tickets 2026
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              The trusted peer-to-peer marketplace for FIFA World Cup 2026 tickets. Safe, secure, and fan-to-fan.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-amber-400">Marketplace</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link to="/browse" className="hover:text-white transition-colors">Browse Tickets</Link>
              <Link to="/sell" className="hover:text-white transition-colors">Sell Tickets</Link>
              <Link to="/profile" className="hover:text-white transition-colors">My Account</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-amber-400">Tournament</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <span>June 11 – July 19, 2026</span>
              <span>USA · Canada · Mexico</span>
              <span>104 Matches · 16 Venues</span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 text-center text-sm text-gray-500">
          © 2026 WC Tickets. Fan-to-fan resale marketplace. Not affiliated with FIFA.
        </div>
      </div>
    </footer>
  )
}
