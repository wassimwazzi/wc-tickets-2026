import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateOffer, useMyOffers, useUpdateOffer } from '@/hooks/useOffers'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import type { Database } from '@/lib/database.types'
import { Minus, AlertCircle } from 'lucide-react'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  match?: Database['public']['Tables']['matches']['Row'] | null
  min_sell_quantity?: number | null
}

const makeSchema = (maxQty: number, minQty: number) => z.object({
  quantity: z.number().int().min(minQty, `Minimum ${minQty} ticket(s)`).max(maxQty, `Max ${maxQty} ticket(s)`),
  amount: z.number({ message: 'Amount must be a number' }).positive({ message: 'Amount must be positive' }),
  currency: z.enum(['USD', 'CAD', 'MXN']),
  message: z.string().optional(),
})

type OfferFormValues = z.infer<ReturnType<typeof makeSchema>>

interface OfferModalProps {
  listing: Listing
  isOpen: boolean
  onClose: () => void
}

export default function OfferModal({ listing, isOpen, onClose }: OfferModalProps) {
  const { user } = useAuth()
  const createOffer = useCreateOffer()
  const updateOffer = useUpdateOffer()
  const { data: myOffers } = useMyOffers(user?.id)

  const maxQty = listing.quantity ?? 1
  const minQty = listing.min_sell_quantity ?? 1

  // Check if buyer already has a pending offer on this listing
  const existingOffer = myOffers?.find(
    o => o.listing_id === listing.id && o.status === 'pending'
  )

  const schema = makeSchema(maxQty, minQty)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<OfferFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: minQty,
      currency: (['USD', 'CAD', 'MXN'].includes(listing.currency ?? '') ? listing.currency : 'USD') as 'USD' | 'CAD' | 'MXN',
    },
  })

  useEffect(() => {
    if (isOpen) reset({ quantity: minQty, currency: (['USD', 'CAD', 'MXN'].includes(listing.currency ?? '') ? listing.currency : 'USD') as 'USD' | 'CAD' | 'MXN' })
  }, [isOpen, minQty, listing.currency, reset])

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
        quantity: values.quantity,
      } as never)
      toast({ title: 'Offer submitted!', description: 'The seller will be notified.' })
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('offers_unique_pending')) {
        toast({ title: 'You already have a pending offer on this listing', description: 'Withdraw it first to submit a new one.', variant: 'destructive' })
      } else {
        toast({ title: 'Failed to submit offer', variant: 'destructive' })
      }
    }
  }

  const handleWithdraw = async () => {
    if (!existingOffer) return
    try {
      await updateOffer.mutateAsync({ id: existingOffer.id, status: 'withdrawn' })
      toast({ title: 'Offer withdrawn' })
      onClose()
    } catch {
      toast({ title: 'Failed to withdraw offer', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existingOffer ? 'Your Pending Offer' : 'Make an Offer'}</DialogTitle>
        </DialogHeader>

        {/* Show existing offer instead of form */}
        {existingOffer ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">You have a pending offer on this listing</span>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p><span className="font-medium">Amount:</span> {formatPrice(existingOffer.amount, existingOffer.currency ?? 'USD')}</p>
                <p><span className="font-medium">Tickets:</span> {existingOffer.quantity ?? 1}</p>
                {existingOffer.message && <p><span className="font-medium">Message:</span> "{existingOffer.message}"</p>}
              </div>
              <p className="text-xs text-amber-600">Withdraw your current offer to submit a new one.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">
                Close
              </button>
              <button
                onClick={handleWithdraw}
                disabled={updateOffer.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
                {updateOffer.isPending ? 'Withdrawing...' : 'Withdraw Offer'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {listing.price && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <span className="text-gray-600">Listed price: </span>
                <span className="font-bold text-red-600">{formatPrice(listing.price, listing.currency ?? 'USD')}</span>
                {listing.price && <span className="text-gray-500 text-xs ml-1">per ticket</span>}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Quantity */}
              <div className="space-y-1">
                <Label htmlFor="offer-quantity">
                  Number of tickets
                  {minQty > 1 && <span className="text-xs text-amber-600 ml-1">(min. {minQty})</span>}
                </Label>
                <Input
                  id="offer-quantity"
                  type="number"
                  min={minQty}
                  max={maxQty}
                  {...register('quantity', { valueAsNumber: true })}
                />
                {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                <p className="text-xs text-slate-400">{maxQty} ticket(s) available</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="amount">Offer amount (per ticket)</Label>
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
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOffer.isPending}
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#E30613' }}
                >
                  {createOffer.isPending ? 'Submitting...' : 'Submit Offer'}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
