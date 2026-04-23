import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toaster'
import type { Database } from '@/lib/database.types'

type EscrowTransaction = Database['public']['Tables']['escrow_transactions']['Row']

const STATUS_STEPS: Record<string, number> = {
  initiated: 1,
  buyer_confirmed: 2,
  seller_confirmed: 3,
  transfer_pending: 4,
  completed: 5,
  disputed: -1,
  cancelled: -1,
}

const STEPS = [
  { label: 'Offer Accepted', description: 'Both parties agreed to terms' },
  { label: 'Buyer Confirms', description: 'Buyer confirms payment is ready' },
  { label: 'Seller Confirms', description: 'Seller confirms ticket transfer' },
  { label: 'Transfer Pending', description: 'Ticket handover in progress' },
  { label: 'Complete', description: 'Transaction finalized' },
]

interface EscrowTrackerProps {
  transaction: EscrowTransaction
}

export default function EscrowTracker({ transaction }: EscrowTrackerProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const currentStep = STATUS_STEPS[transaction.status ?? 'initiated'] ?? 1
  const isBuyer = user?.id === transaction.buyer_id
  const isSeller = user?.id === transaction.seller_id

  const updateStatus = async (newStatus: string) => {
    const { error } = await supabase
      .from('escrow_transactions')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ status: newStatus } as any)
      .eq('id', transaction.id)
    if (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' })
      return
    }
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    toast({ title: 'Status updated successfully' })
  }

  if (transaction.status === 'disputed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <div>
          <p className="font-semibold text-red-800">Dispute Raised</p>
          <p className="text-sm text-red-600">Contact support to resolve.</p>
        </div>
      </div>
    )
  }

  if (transaction.status === 'cancelled') {
    return (
      <div className="bg-gray-50 border rounded-lg p-4 text-gray-500 text-sm">
        Transaction cancelled.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const stepNum = index + 1
          const isCompleted = currentStep > stepNum
          const isCurrent = currentStep === stepNum

          return (
            <div key={index} className="flex flex-col items-center flex-1 relative">
              {index < STEPS.length - 1 && (
                <div className={`absolute top-3 left-1/2 w-full h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                isCompleted ? 'bg-green-500 text-white' :
                isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <p className="text-xs font-medium mt-1 text-center hidden sm:block">{step.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 rounded-lg p-3">
        <p className="font-medium text-sm text-blue-900">{STEPS[(currentStep - 1)]?.label}</p>
        <p className="text-xs text-blue-700 mt-0.5">{STEPS[(currentStep - 1)]?.description}</p>
        {transaction.buyer_confirmed_at && (
          <p className="text-xs text-gray-500 mt-1">Buyer confirmed: {formatDate(transaction.buyer_confirmed_at)}</p>
        )}
        {transaction.seller_confirmed_at && (
          <p className="text-xs text-gray-500">Seller confirmed: {formatDate(transaction.seller_confirmed_at)}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {isBuyer && transaction.status === 'initiated' && (
          <Button
            size="sm"
            onClick={() => updateStatus('buyer_confirmed')}
            style={{ backgroundColor: '#0033A0', color: 'white' }}
          >
            Confirm Payment Ready
          </Button>
        )}
        {isSeller && transaction.status === 'buyer_confirmed' && (
          <Button
            size="sm"
            onClick={() => updateStatus('seller_confirmed')}
            style={{ backgroundColor: '#0033A0', color: 'white' }}
          >
            Confirm Transfer
          </Button>
        )}
        {isBuyer && transaction.status === 'seller_confirmed' && (
          <Button
            size="sm"
            onClick={() => updateStatus('completed')}
            style={{ backgroundColor: '#16a34a', color: 'white' }}
          >
            Confirm Receipt
          </Button>
        )}
        {(isBuyer || isSeller) && !['completed', 'disputed', 'cancelled'].includes(transaction.status ?? '') && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatus('disputed')}
            className="text-red-600 border-red-300"
          >
            Raise Dispute
          </Button>
        )}
      </div>
    </div>
  )
}
