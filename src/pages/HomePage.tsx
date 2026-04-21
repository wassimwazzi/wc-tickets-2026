import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Search, HandshakeIcon, Shield, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ListingGrid from '@/components/listings/ListingGrid'
import { useListings } from '@/hooks/useListings'

const STAGES = [
  { key: 'GROUP', label: 'Group Stage', matches: '72 matches', color: '#0033A0' },
  { key: 'R32', label: 'Round of 32', matches: '16 matches', color: '#16a34a' },
  { key: 'R16', label: 'Round of 16', matches: '8 matches', color: '#d97706' },
  { key: 'QF', label: 'Quarter-Finals', matches: '4 matches', color: '#ea580c' },
  { key: 'SF', label: 'Semi-Finals', matches: '2 matches', color: '#E30613' },
  { key: 'FINAL', label: 'The Final', matches: '1 match', color: '#F0A500' },
]

const HOW_IT_WORKS = [
  { icon: <Search className="w-8 h-8" />, title: 'Search', description: 'Browse thousands of listings for all 104 World Cup matches across 16 venues in 3 countries.' },
  { icon: <HandshakeIcon className="w-8 h-8" />, title: 'Offer', description: 'Make a secure offer to the seller. Negotiate price and terms directly through the platform.' },
  { icon: <Shield className="w-8 h-8" />, title: 'Escrow', description: 'Our escrow system ensures safe transfer. Funds only release when both parties confirm.' },
]

export default function HomePage() {
  const { data: listings = [], isLoading } = useListings({ status: 'available' })
  const latestListings = listings.slice(0, 6)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative py-24 px-4 text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0033A0 0%, #E30613 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">⚽</div>
          <div className="absolute bottom-10 right-10 text-9xl">��</div>
        </div>
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-yellow-400" />
            </div>
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "'Russo One', sans-serif" }}
            >
              Find Your<br />
              <span className="text-yellow-400">World Cup</span> Seat
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
              The trusted fan-to-fan marketplace for FIFA World Cup 2026 tickets.
              USA · Canada · Mexico · June 11 – July 19
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/browse">
                <Button size="lg" className="text-lg px-8 font-bold" style={{ backgroundColor: '#F0A500', color: '#1E293B' }} >
                  Browse Tickets
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" className="text-lg px-8 font-bold text-white border-2" style={{ borderColor: '#F0A500', color: 'white' }} variant="outline">
                  Sell Tickets
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '104', label: 'Total Matches' },
              { value: '16', label: 'Venues' },
              { value: '3', label: 'Host Countries' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-yellow-400" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Stage */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Russo One', sans-serif", color: '#0033A0' }}>
            Browse by Stage
          </h2>
          <p className="text-gray-600 mb-8">Find tickets for every round of the tournament</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STAGES.map(stage => (
              <Link key={stage.key} to={`/browse?stage=${stage.key}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer text-center h-full">
                  <CardContent className="pt-6 pb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg"
                      style={{ backgroundColor: stage.color }}
                    >
                      ⚽
                    </div>
                    <p className="font-bold text-sm">{stage.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{stage.matches}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#0033A0' }}>
                Latest Listings
              </h2>
              <p className="text-gray-600 mt-1">Fresh tickets just posted by fans</p>
            </div>
            <Link to="/browse">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <ListingGrid listings={latestListings} isLoading={isLoading} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: "'Russo One', sans-serif", color: '#0033A0' }}>
            How It Works
          </h2>
          <p className="text-gray-600 text-center mb-12">Three simple steps to secure your World Cup experience</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full">
                  <CardContent className="pt-8 pb-6">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
                      style={{ backgroundColor: '#E30613' }}
                    >
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 px-4 text-white" style={{ background: 'linear-gradient(135deg, #0033A0 0%, #002080 100%)' }}>
        <div className="container mx-auto text-center">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Russo One', sans-serif" }}>
            100% Escrow Protected
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Every transaction on WC Tickets 2026 is protected by our escrow system.
            Your money is held safely until both buyer and seller confirm the ticket transfer.
            We take disputes seriously and resolve every issue fairly.
          </p>
        </div>
      </section>
    </div>
  )
}
