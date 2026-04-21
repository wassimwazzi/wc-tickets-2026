import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Stage</Label>
        <Select value={stage} onValueChange={handleStageChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? '_all')}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Categories</SelectItem>
            <SelectItem value="1">Cat 1 - Premium</SelectItem>
            <SelectItem value="2">Cat 2 - Sideline</SelectItem>
            <SelectItem value="3">Cat 3 - Behind Goal</SelectItem>
            <SelectItem value="4">Cat 4 - Upper Tier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Currency</Label>
        <Select value={currency} onValueChange={(v) => setCurrency(v ?? '_all')}>
          <SelectTrigger>
            <SelectValue placeholder="All Currencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Currencies</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="CAD">CAD</SelectItem>
            <SelectItem value="MXN">MXN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button
        className="w-full flex items-center justify-center gap-2 py-2 px-4 border rounded-lg text-sm hover:bg-gray-50"
        onClick={clearFilters}
      >
        <X className="w-4 h-4" /> Clear Filters
      </button>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Russo One', sans-serif", color: '#0033A0' }}>
        Browse Tickets
      </h1>
      <p className="text-gray-600 mb-6">Find the perfect seat for your World Cup experience</p>

      <div className="flex gap-8">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border p-5 sticky top-24">
            <h2 className="font-semibold mb-4">Filters</h2>
            <FiltersContent />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            {/* Mobile filter button */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4" /> Filters
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <p className="text-sm text-gray-600 font-medium">
              {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
            </p>

            <Select value={sort} onValueChange={(v) => setSort(v ?? 'newest')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ListingGrid listings={filteredListings} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
