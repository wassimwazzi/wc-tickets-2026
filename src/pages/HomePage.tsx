import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Search, HandshakeIcon, Shield, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ListingGrid from '@/components/listings/ListingGrid'
import { useListings } from '@/hooks/useListings'

const STAGES = [
  { key: 'GROUP', label: 'Group Stage', matches: '72 matches', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  { key: 'R32', label: 'Round of 32', matches: '16 matches', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  { key: 'R16', label: 'Round of 16', matches: '8 matches', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  { key: 'QF', label: 'Quarter-Finals', matches: '4 matches', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  { key: 'SF', label: 'Semi-Finals', matches: '2 matches', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  { key: 'FINAL', label: 'The Final', matches: '1 match', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100' },
]

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: <Search className="w-6 h-6" />,
    title: 'Search & Filter',
    description: 'Browse thousands of listings for all 104 World Cup matches across 16 venues in 3 countries.',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    numColor: 'text-blue-200',
  },
  {
    num: '02',
    icon: <HandshakeIcon className="w-6 h-6" />,
    title: 'Make an Offer',
    description: 'Make a secure offer to the seller. Negotiate price and terms directly through the platform.',
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    numColor: 'text-rose-200',
  },
  {
    num: '03',
    icon: <Shield className="w-6 h-6" />,
    title: 'Safe Escrow',
    description: 'Our escrow system ensures safe transfer. Funds only release when both parties confirm.',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    numColor: 'text-emerald-200',
  },
]

export default function HomePage() {
  const { data: listings = [], isLoading } = useListings({ status: 'available' })
  const latestListings = listings.slice(0, 6)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4" style={{
        background: 'linear-gradient(135deg, #0033A0 0%, #001a6e 40%, #8B0000 80%, #E30613 100%)'
      }}>
        {/* Mesh overlay dots */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#F0A500' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#E30613' }} />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Announcement pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>FIFA World Cup 2026 · June 11 – July 19</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white" style={{ fontFamily: '"Noto Serif Display", Georgia, serif' }}>
              Find Your<br />
              <em className="not-italic" style={{ color: '#F0A500' }}>World Cup</em> Seat
            </h1>
            <p className="text-lg md:text-xl mb-10 text-white/80 max-w-xl mx-auto leading-relaxed">
              The trusted fan-to-fan marketplace for FIFA World Cup 2026 tickets.
              USA · Canada · Mexico
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/browse">
                <Button size="lg" className="text-base px-8 py-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: '#F0A500', color: '#1E293B' }}>
                  Browse Tickets
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-2xl font-bold border-2 border-white/40 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
                  Sell Tickets
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats — friendly pill cards */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { value: '104', label: 'Matches', color: 'bg-blue-50 text-blue-700' },
              { value: '16', label: 'Venues', color: 'bg-rose-50 text-rose-700' },
              { value: '3', label: 'Countries', color: 'bg-emerald-50 text-emerald-700' },
            ].map(stat => (
              <div key={stat.label} className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${stat.color}`}>
                <span className="text-2xl font-bold" style={{ fontFamily: '"Noto Serif Display", Georgia, serif' }}>{stat.value}</span>
                <span className="text-sm font-medium opacity-80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Stage */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: '"Noto Serif Display", Georgia, serif' }}>
              Browse by Stage
            </h2>
            <p className="text-slate-500">Find tickets for every round of the tournament</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link to={`/browse?stage=${stage.key}`}>
                  <div className={`rounded-2xl border ${stage.bg} ${stage.border} p-4 text-center hover:shadow-md transition-all cursor-pointer group`}>
                    <div className="text-2xl mb-2">⚽</div>
                    <p className={`font-bold text-sm ${stage.text}`}>{stage.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{stage.matches}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: '"Noto Serif Display", Georgia, serif' }}>
                Latest Listings
              </h2>
              <p className="text-slate-500 mt-1">Fresh tickets just posted by fans</p>
            </div>
            <Link to="/browse">
              <Button variant="outline" className="rounded-xl font-semibold">View All</Button>
            </Link>
          </div>
          <ListingGrid listings={latestListings} isLoading={isLoading} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: '"Noto Serif Display", Georgia, serif' }}>
              How It Works
            </h2>
            <p className="text-slate-500">Three simple steps to secure your World Cup experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
              >
                <div className={`rounded-3xl p-8 h-full ${step.bg} relative overflow-hidden`}>
                  {/* Large background number */}
                  <div className={`absolute top-4 right-5 text-7xl font-black ${step.numColor} select-none leading-none`} style={{ fontFamily: '"Noto Serif Display", Georgia, serif' }}>
                    {step.num}
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${step.iconBg} ${step.iconColor} flex items-center justify-center mb-5 relative z-10`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed relative z-10">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0033A0 0%, #001a6e 100%)' }}>
            <div className="px-8 py-12 md:py-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />
              <Shield className="w-14 h-14 mx-auto mb-5 relative z-10" style={{ color: '#F0A500' }} />
              <h2 className="text-3xl font-bold text-white mb-4 relative z-10" style={{ fontFamily: '"Noto Serif Display", Georgia, serif' }}>
                100% Escrow Protected
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto leading-relaxed relative z-10">
                Every transaction on WC Tickets 2026 is protected by our escrow system.
                Your money is held safely until both buyer and seller confirm the ticket transfer.
                We take disputes seriously and resolve every issue fairly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

