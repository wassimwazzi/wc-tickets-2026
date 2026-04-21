import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateOffer } from '@/hooks/useOffers'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import type { Database } from '@/lib/database.types'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  match?: Database['public']['Tables']['matches']['Row'] | null
}

const offerSchema = z.object({
  amount: z.number({ message: 'Amount must be a number' }).positive({ message: 'Amount must be positive' }),
  currency: z.enum(['USD', 'CAD', 'MXN']),
  message: z.string().optional(),
})

type OfferFormValues = z.infer<typeof offerSchema>

interface OfferModalProps {
  listing: Listing
  isOpen: boolean
  onClose: () => void
}

export default function OfferModal({ listing, isOpen, onClose }: OfferModalProps) {
  const { user } = useAuth()
  const createOffer = useCreateOffer()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      currency: (['USD', 'CAD', 'MXN'].includes(listing.currency ?? '') ? listing.currency : 'USD') as 'USD' | 'CAD' | 'MXN',
    },
  })

  const currency = watch('currency')

  const onSubmit = async (values: OfferFormValues) => {
    if (!user) return
    try {
      await createOffer.mutateAsync({
        listing_id: listing.id,
        buyer_id: user.id,
        amount: values.amount,
        currency: values.currency,
        message: values.message ?? null,
      })
      toast({ title: 'Offer submitted!', description: 'The seller will be notified.' })
      onClose()
    } catch {
      toast({ title: 'Failed to submit offer', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
        </DialogHeader>

        {listing.price && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <span className="text-gray-600">Listed price: </span>
            <span className="font-bold text-red-600">{formatPrice(listing.price, listing.currency ?? 'USD')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="amount">Your Offer Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => v && setValue('currency', v as 'USD' | 'CAD' | 'MXN')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="MXN">MXN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a note to the seller..."
              rows={3}
              {...register('message')}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createOffer.isPending}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#E30613' }}
            >
              {createOffer.isPending ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
