import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import ListingGrid from '@/components/listings/ListingGrid'
import { useListings } from '@/hooks/useListings'
import { cn } from '@/lib/utils'

const STAGES = [
  { value: 'GROUP', label: 'Group Stage', short: 'Group' },
  { value: 'R32', label: 'Round of 32', short: 'R32' },
  { value: 'R16', label: 'Round of 16', short: 'R16' },
  { value: 'QF', label: 'Quarter-Finals', short: 'QF' },
  { value: 'SF', label: 'Semi-Finals', short: 'SF' },
  { value: '3RD', label: '3rd Place', short: '3rd' },
  { value: 'FINAL', label: 'Final', short: 'Final' },
]

const LOCATIONS = [
  { value: 'USA', label: '🇺🇸 USA' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'Mexico', label: '🇲🇽 Mexico' },
]

const CATEGORIES = [
  { value: '1', label: 'Cat 1 – Premium' },
  { value: '2', label: 'Cat 2 – VIP' },
  { value: '3', label: 'Cat 3 – Standard' },
  { value: '4', label: 'Cat 4 – Economy' },
]

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // All filter state lives here
  const [searchText, setSearchText] = useState('')
  const [stage, setStage] = useState(searchParams.get('stage') ?? '')
  const [country, setCountry] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('newest')
  const [sheetOpen, setSheetOpen] = useState(false)

  // Sync stage from URL params (e.g. from homepage stage tiles)
  useEffect(() => {
    const s = searchParams.get('stage')
    if (s) setStage(s)
  }, [searchParams])

  // Fetch all available listings (server filters only what's practical)
  const serverFilters = useMemo(() => ({
    category: category ? parseInt(category) : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    status: 'available' as const,
  }), [category, minPrice, maxPrice])

  const { data: allListings = [], isLoading, isError } = useListings(serverFilters)

  // Client-side filtering for joined match fields (stage, country, text, date)
  const filteredListings = useMemo(() => {
    let results = allListings

    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      results = results.filter((l) => {
        const m = l.match
        return (
          m?.team1?.toLowerCase().includes(q) ||
          m?.team2?.toLowerCase().includes(q) ||
          m?.venue?.toLowerCase().includes(q) ||
          m?.city?.toLowerCase().includes(q) ||
          m?.country?.toLowerCase().includes(q) ||
          String(m?.match_number).includes(q)
        )
      })
    }

    if (stage) {
      results = results.filter((l) => l.match?.stage === stage)
    }

    if (country) {
      results = results.filter((l) => l.match?.country === country)
    }

    if (dateFrom) {
      results = results.filter((l) => l.match?.match_date && l.match.match_date >= dateFrom)
    }

    if (dateTo) {
      results = results.filter((l) => l.match?.match_date && l.match.match_date <= dateTo + 'T23:59:59')
    }

    return [...results].sort((a, b) => {
      if (sort === 'price-asc') return (a.price ?? Infinity) - (b.price ?? Infinity)
      if (sort === 'price-desc') return (b.price ?? 0) - (a.price ?? 0)
      if (sort === 'date-asc') return new Date(a.match?.match_date ?? 0).getTime() - new Date(b.match?.match_date ?? 0).getTime()
      // newest (default)
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    })
  }, [allListings, searchText, stage, country, dateFrom, dateTo, sort])

  const activeFilterCount = [stage, country, category, minPrice, maxPrice, dateFrom, dateTo].filter(Boolean).length

  const clearFilters = () => {
    setSearchText('')
    setStage('')
    setCountry('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setDateFrom('')
    setDateTo('')
    setSearchParams({})
  }

  const handleStageToggle = (val: string) => {
    const next = stage === val ? '' : val
    setStage(next)
    if (next) setSearchParams({ stage: next })
    else setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-orange-500 text-white py-12 pb-0">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Browse Tickets</h1>
          <p className="text-blue-100 mb-6 text-lg">Find your perfect World Cup 2026 seat</p>

          {/* Search bar */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <Input
                data-testid="search-input"
                placeholder="Search by team, city, venue…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 h-12 text-base bg-white text-slate-900 border-0 shadow-lg focus-visible:ring-2 focus-visible:ring-orange-400"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* More Filters sheet trigger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                data-testid="filters-button"
                className="h-12 px-5 bg-white text-blue-700 border-0 shadow-lg hover:bg-blue-50 font-semibold relative inline-flex items-center rounded-md text-sm"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5">
                    {activeFilterCount}
                    </Badge>
                  )}
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96">
                <SheetHeader className="mb-6">
                  <SheetTitle>More Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 overflow-y-auto pb-8">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Ticket Category</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(c => (
                        <button
                          key={c.value}
                          data-testid={`category-filter-${c.value}`}
                          onClick={() => setCategory(category === c.value ? '' : c.value)}
                          className={cn(
                            'text-sm px-3 py-2 rounded-lg border font-medium transition-all',
                            category === c.value
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Price Range (USD)</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="flex-1"
                        data-testid="min-price-input"
                      />
                      <span className="text-slate-400">–</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="flex-1"
                        data-testid="max-price-input"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Match Date</Label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Label className="text-xs text-slate-500 mb-1 block">From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          data-testid="date-from-input"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-slate-500 mb-1 block">To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          data-testid="date-to-input"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setCategory('')
                      setMinPrice('')
                      setMaxPrice('')
                      setDateFrom('')
                      setDateTo('')
                    }}
                  >
                    Reset Sheet Filters
                  </Button>
                  <Button
                    className="w-full font-bold"
                    style={{ backgroundColor: '#2563EB', color: 'white' }}
                    onClick={() => setSheetOpen(false)}
                  >
                    Show {filteredListings.length} results
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Quick Filter Chips Row — Stage */}
          <div className="mt-6 -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 pb-3 min-w-max">
              {STAGES.map((s) => (
                <button
                  key={s.value}
                  data-testid={`stage-chip-${s.value}`}
                  onClick={() => handleStageToggle(s.value)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-150',
                    stage === s.value
                      ? 'bg-white text-blue-700 border-white shadow-md'
                      : 'bg-transparent text-white border-white/40 hover:border-white/80'
                  )}
                >
                  {s.short}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filter Chips Row — Location */}
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 pb-4 min-w-max">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.value}
                  data-testid={`location-chip-${loc.value.replace(' ', '-')}`}
                  onClick={() => setCountry(country === loc.value ? '' : loc.value)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-150',
                    country === loc.value
                      ? 'bg-white text-blue-700 border-white shadow-md'
                      : 'bg-transparent text-white border-white/40 hover:border-white/80'
                  )}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 mr-1">Active:</span>
            {stage && (
              <FilterChip
                label={`Stage: ${STAGES.find(s => s.value === stage)?.label}`}
                onRemove={() => setStage('')}
              />
            )}
            {country && (
              <FilterChip
                label={`${LOCATIONS.find(l => l.value === country)?.label}`}
                onRemove={() => setCountry('')}
              />
            )}
            {category && (
              <FilterChip
                label={`Cat ${category}`}
                onRemove={() => setCategory('')}
              />
            )}
            {(minPrice || maxPrice) && (
              <FilterChip
                label={`$${minPrice || '0'} – $${maxPrice || '∞'}`}
                onRemove={() => { setMinPrice(''); setMaxPrice('') }}
              />
            )}
            {(dateFrom || dateTo) && (
              <FilterChip
                label={`${dateFrom || '…'} → ${dateTo || '…'}`}
                onRemove={() => { setDateFrom(''); setDateTo('') }}
              />
            )}
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-slate-500 underline hover:text-slate-700"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600" data-testid="results-count">
            <span className="font-bold text-slate-900 text-lg">{filteredListings.length}</span>
            {' '}{filteredListings.length === 1 ? 'listing' : 'listings'} found
          </p>
          <Select value={sort} onValueChange={(v) => setSort(v ?? 'newest')}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
              <SelectItem value="date-asc">Match Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isError ? (
          <div className="text-center py-20">
            <p className="text-xl font-bold text-red-600 mb-2">Failed to load listings</p>
            <p className="text-slate-500">Please refresh the page or try again later.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎟️</div>
            <p className="text-2xl font-bold text-slate-900 mb-2">No tickets found</p>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              {activeFilterCount > 0 || searchText
                ? 'Try adjusting your search or filters'
                : 'No listings yet. Be the first to sell!'}
            </p>
            {(activeFilterCount > 0 || searchText) && (
              <Button onClick={clearFilters} className="font-semibold">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <ListingGrid listings={filteredListings} />
        )}
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string | undefined; onRemove: () => void }) {
  if (!label) return null
  return (
    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="ml-1 hover:text-blue-900">
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
