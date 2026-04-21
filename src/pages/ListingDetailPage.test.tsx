import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListingDetailPage from './ListingDetailPage'

vi.mock('@/hooks/useListings', () => ({
  useListing: () => ({
    isLoading: false,
    data: {
      id: 'listing-1',
      seller_id: 'seller-1',
      status: 'available',
      category: 1,
      section: '101',
      row_label: 'A',
      seat_number: '9',
      quantity: 1,
      price: 320,
      currency: 'USD',
      notes: null,
      created_at: '2026-04-20T00:00:00.000Z',
      match: {
        id: 'match-1',
        match_number: 1,
        team1: 'USA',
        team2: 'Canada',
        team1_code: 'US',
        team2_code: 'CA',
        venue: 'Stadium',
        city: 'Los Angeles',
        country: 'USA',
        stage: 'GROUP',
        group_name: 'A',
        match_date: '2026-06-11T00:00:00.000Z',
        created_at: null,
      },
      seller: {
        id: 'seller-1',
        full_name: 'Known Seller',
        avatar_url: null,
        contact_preference: 'email',
        contact_info: 'seller@example.com',
        reputation_score: 4.5,
        total_reviews: 10,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: null,
      },
    },
  }),
}))

vi.mock('@/hooks/useOffers', () => ({
  useOffers: () => ({ data: [] }),
  useUpdateOffer: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'buyer-1' } }),
}))

vi.mock('@/components/matches/MatchBadge', () => ({
  default: () => <div>Match Badge</div>,
}))

vi.mock('@/components/offers/OfferModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>Offer modal opened</div> : null),
}))

describe('ListingDetailPage', () => {
  it('shows seller name and lets authenticated buyer start offer flow', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/listings/listing-1']}>
        <Routes>
          <Route path="/listings/:id" element={<ListingDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Known Seller')).toBeInTheDocument()
    expect(screen.queryByText('Anonymous')).not.toBeInTheDocument()

    const messageLink = screen.getByRole('link', { name: /contact seller via email/i })
    expect(messageLink).toHaveAttribute('href', 'mailto:seller@example.com')

    await user.click(screen.getByRole('button', { name: /make offer/i }))
    expect(screen.getByText('Offer modal opened')).toBeInTheDocument()
  })
})
