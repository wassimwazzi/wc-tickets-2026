import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OfferModal from '@/components/offers/OfferModal'
import type { Database } from '@/lib/database.types'

const mockMutateAsync = vi.fn()
const mockWithdrawAsync = vi.fn()
let mockMyOffersData: unknown[] = []

vi.mock('@/hooks/useOffers', () => ({
  useCreateOffer: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useUpdateOffer: () => ({
    mutateAsync: mockWithdrawAsync,
    isPending: false,
  }),
  useMyOffers: () => ({
    data: mockMyOffersData,
  }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'buyer-1' } }),
}))

vi.mock('@/components/ui/toaster', () => ({
  toast: vi.fn(),
}))

// Render dialog content inline to avoid portal issues in JSDOM
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

type Listing = Database['public']['Tables']['listings']['Row'] & {
  match?: Database['public']['Tables']['matches']['Row'] | null
}

const MOCK_LISTING = {
  id: 'listing-1',
  seller_id: 'seller-1',
  match_id: 'match-1',
  status: 'available',
  category: 1,
  section: '101',
  row_label: 'A',
  seat_number: '9',
  quantity: 1,
  min_sell_quantity: 1,
  price: 320,
  currency: 'USD',
  notes: null,
  created_at: '2026-04-20T00:00:00.000Z',
  updated_at: null,
  match: null,
} as Listing

describe('OfferModal', () => {
  beforeEach(() => {
    mockMutateAsync.mockReset()
    mockMutateAsync.mockResolvedValue({})
    mockWithdrawAsync.mockReset()
    mockWithdrawAsync.mockResolvedValue({})
    mockMyOffersData = []
  })

  it('submits offer with amount and message', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<OfferModal listing={MOCK_LISTING} isOpen={true} onClose={onClose} />)

    // Amount field is the second spinbutton (first is quantity)
    const spinbuttons = screen.getAllByRole('spinbutton')
    const amountInput = spinbuttons.find(el => (el as HTMLInputElement).placeholder === '0.00')!
    fireEvent.change(amountInput, { target: { value: '275' } })
    await user.type(screen.getByLabelText(/message/i), 'Best price?')

    fireEvent.submit(amountInput.closest('form')!)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          listing_id: 'listing-1',
          buyer_id: 'buyer-1',
          amount: 275,
          currency: 'USD',
          message: 'Best price?',
        }),
      )
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('does not submit when amount is missing', async () => {
    const user = userEvent.setup()

    render(<OfferModal listing={MOCK_LISTING} isOpen={true} onClose={vi.fn()} />)

    // Click submit without filling in amount (quantity has a default, amount doesn't)
    await user.click(screen.getByRole('button', { name: /submit offer/i }))

    // Mutation should not be called when validation fails
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<OfferModal listing={MOCK_LISTING} isOpen={true} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows existing pending offer instead of form and allows withdrawal', async () => {
    mockMyOffersData = [{
      id: 'offer-1',
      listing_id: 'listing-1',
      buyer_id: 'buyer-1',
      status: 'pending',
      amount: 200,
      currency: 'USD',
      quantity: 1,
      message: 'Is this still available?',
    }]

    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<OfferModal listing={MOCK_LISTING} isOpen={true} onClose={onClose} />)

    // Should show pending offer summary, not the submission form
    expect(screen.getByText(/you have a pending offer/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /submit offer/i })).not.toBeInTheDocument()

    // Withdraw button visible and triggers mutation + close
    await user.click(screen.getByRole('button', { name: /withdraw offer/i }))
    await waitFor(() => {
      expect(mockWithdrawAsync).toHaveBeenCalledWith({ id: 'offer-1', status: 'withdrawn' })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('enforces min_sell_quantity in quantity field', () => {
    const listingWithMin = { ...MOCK_LISTING, quantity: 4, min_sell_quantity: 2 }
    render(<OfferModal listing={listingWithMin} isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText(/min\. 2/i)).toBeInTheDocument()
    expect(screen.getByText(/4 ticket\(s\) available/i)).toBeInTheDocument()
  })
})

