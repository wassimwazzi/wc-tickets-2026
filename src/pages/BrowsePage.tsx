import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import ListingGrid from '@/components/listings/ListingGrid'
import { useListings } from '@/hooks/useListings'

const STAGES = [
  { value: '_all', label: 'All Stages' },
  { value: 'GROUP', label: 'Group Stage' },
  { value: 'R32', label: 'Round of 32' },
  { value: 'R16', label: 'Round of 16' },
  { value: 'QF', label: 'Quarter-Finals' },
  { value: 'SF', label: 'Semi-Finals' },
  { value: '3RD', label: '3rd Place' },
  { value: 'FINAL', label: 'Final' },
]

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [stage, setStage] = useState(searchParams.get('stage') ?? '_all')
  const [category, setCategory] = useState('_all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [currency, setCurrency] = useState('_all')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    const s = searchParams.get('stage')
    if (s) setStage(s)
  }, [searchParams])

  const filters = {
    category: category && category !== '_all' ? parseInt(category) : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    currency: currency && currency !== '_all' ? currency : undefined,
  }

  const { data: listings = [], isLoading } = useListings(filters)

  const filteredListings = [...listings].sort((a, b) => {
    if (sort === 'price-asc') return (a.price ?? Infinity) - (b.price ?? Infinity)
    if (sort === 'price-desc') return (b.price ?? 0) - (a.price ?? 0)
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  })

  const clearFilters = () => {
    setStage('_all')
    setCategory('_all')
    setMinPrice('')
    setMaxPrice('')
    setCurrency('_all')
    setSearchParams({})
  }

  const handleStageChange = (v: string | null) => {
    const val = v ?? '_all'
    setStage(val)
    if (val && val !== '_all') setSearchParams({ stage: val })
    else setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Vibrant gradient */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Tickets</h1>
          <p className="text-blue-100 mb-8 text-lg">Find your perfect World Cup 2026 seat</p>
          
          {/* Search + Quick Filters */}
          <div className="flex gap-3 flex-col md:flex-row md:items-end">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by team, city, or match..."
                className="pl-10 h-12 text-lg bg-white text-slate-900"
              />
            </div>
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 cursor-pointer">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </SheetTrigger>
              <SheetContent side="left" className="w-full md:w-96">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FiltersContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-600 text-lg">
              <span className="font-semibold text-slate-900">{filteredListings.length}</span> listings found
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="sort" className="text-sm font-medium text-slate-600">Sort by:</Label>
            <Select value={sort} onValueChange={(v) => setSort(v ?? 'newest')}>
              <SelectTrigger id="sort" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Chips */}
        {(stage !== '_all' || category !== '_all' || minPrice || maxPrice || currency !== '_all') && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            {stage !== '_all' && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {STAGES.find(s => s.value === stage)?.label}
                <button onClick={() => setStage('_all')} className="hover:opacity-70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {category !== '_all' && (
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Category {category}
                <button onClick={() => setCategory('_all')} className="hover:opacity-70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-600 underline">
              Clear all
            </Button>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold text-slate-900 mb-2">No tickets found</p>
            <p className="text-slate-600 mb-6">Try adjusting your filters or check back later</p>
            <Button onClick={clearFilters}>Clear filters</Button>
          </div>
        ) : (
          <ListingGrid listings={filteredListings} />
        )}
      </div>
    </div>
  )
}

function FiltersContent() {
  const [stage, setStage] = useState('_all')
  const [category, setCategory] = useState('_all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [currency, setCurrency] = useState('_all')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="font-semibold">Tournament Stage</Label>
        <Select value={stage} onValueChange={(v) => setStage(v ?? '_all')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? '_all')}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Categories</SelectItem>
            <SelectItem value="1">Category 1 – Premium</SelectItem>
            <SelectItem value="2">Category 2 – VIP</SelectItem>
            <SelectItem value="3">Category 3 – Standard</SelectItem>
            <SelectItem value="4">Category 4 – Economy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Price Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Currency</Label>
        <Select value={currency} onValueChange={(v) => setCurrency(v ?? '_all')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Currencies</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="CAD">CAD</SelectItem>
            <SelectItem value="MXN">MXN</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
