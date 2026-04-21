import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MatchSearch from '@/components/matches/MatchSearch'
import { useCreateListing } from '@/hooks/useListings'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/toaster'
import type { Database } from '@/lib/database.types'

type Match = Database['public']['Tables']['matches']['Row']

const schema = z.object({
  section: z.string().min(1, 'Section is required'),
  row_label: z.string().min(1, 'Row is required'),
  seat_number: z.string().min(1, 'Seat number is required'),
  quantity: z.number().int().min(1).max(10),
  category: z.number().int().min(1).max(4),
  price: z.number().positive({ message: 'Price must be positive' }).optional().nullable(),
  currency: z.enum(['USD', 'CAD', 'MXN']),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function CreateListingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const createListing = useCreateListing()
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchError, setMatchError] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      category: 1,
      currency: 'USD',
    },
  })

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!user) {
    return <Navigate to="/?openlogin=1" replace />
  }

  const onSubmit = async (values: FormValues) => {
    if (!selectedMatch) {
      setMatchError('Please select a match')
      return
    }
    setMatchError('')
    try {
      const data = await createListing.mutateAsync({
        seller_id: user.id,
        match_id: selectedMatch.id,
        section: values.section,
        row_label: values.row_label,
        seat_number: values.seat_number,
        quantity: values.quantity,
        category: values.category as 1 | 2 | 3 | 4,
        price: values.price ?? null,
        currency: values.currency,
        notes: values.notes ?? null,
      })
      toast({ title: 'Listing created!', description: 'Your ticket is now live.' })
      navigate(`/listings/${(data as { id: string })?.id ?? ''}`)
    } catch {
      toast({ title: 'Failed to create listing', variant: 'destructive' })
    }
  }

  const category = watch('category')
  const currency = watch('currency')

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Russo One', sans-serif", color: '#0033A0' }}>
        Sell Your Ticket
      </h1>
      <p className="text-gray-600 mb-8">List your World Cup 2026 ticket on the marketplace</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Match Selection */}
        <Card>
          <CardHeader><CardTitle className="text-base">Select Match</CardTitle></CardHeader>
          <CardContent>
            <MatchSearch
              onSelect={(match) => { setSelectedMatch(match); setMatchError('') }}
              selectedMatch={selectedMatch}
              placeholder="Search for a match..."
            />
            {matchError && <p className="text-xs text-red-500 mt-1">{matchError}</p>}
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Ticket Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="section">Section *</Label>
                <Input id="section" {...register('section')} placeholder="e.g. 101" />
                {errors.section && <p className="text-xs text-red-500">{errors.section.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="row">Row *</Label>
                <Input id="row" {...register('row_label')} placeholder="e.g. A" />
                {errors.row_label && <p className="text-xs text-red-500">{errors.row_label.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="seat">Seat *</Label>
                <Input id="seat" {...register('seat_number')} placeholder="e.g. 12" />
                {errors.seat_number && <p className="text-xs text-red-500">{errors.seat_number.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={10}
                  {...register('quantity', { valueAsNumber: true })}
                />
                {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Category *</Label>
                <Select value={String(category)} onValueChange={(v) => setValue('category', parseInt(v ?? '1'))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Cat 1 - Premium</SelectItem>
                    <SelectItem value="2">Cat 2 - Sideline</SelectItem>
                    <SelectItem value="3">Cat 3 - Behind Goal</SelectItem>
                    <SelectItem value="4">Cat 4 - Upper Tier</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="price">Price (leave empty for "on request")</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('price', { setValueAs: v => (v === '' || v == null) ? null : parseFloat(v) })}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={(v) => setValue('currency', v as 'USD' | 'CAD' | 'MXN')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle className="text-base">Additional Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional information for potential buyers..."
              rows={4}
              {...register('notes')}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={createListing.isPending}
          className="w-full text-base py-3"
          style={{ backgroundColor: '#E30613', color: 'white' }}
        >
          {createListing.isPending ? 'Creating Listing...' : 'Post Listing'}
        </Button>
      </form>
    </div>
  )
}
