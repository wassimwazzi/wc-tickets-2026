import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProfilePage from '@/pages/ProfilePage'

const mockDeleteListing = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'user@example.com' },
    profile: {
      full_name: 'Test User',
      avatar_url: null,
      reputation_score: 4.2,
      total_reviews: 3,
    },
  }),
}))

vi.mock('@/hooks/useListings', () => ({
  useListings: () => ({
    data: [
      {
        id: 'listing-1',
        status: 'available',
        category: 1,
        section: '101',
        row_label: 'A',
        seat_number: '5',
        quantity: 1,
        price: 300,
        currency: 'USD',
        created_at: '2026-04-01T00:00:00.000Z',
        match: { team1: 'USA', team2: 'Mexico', match_date: '2026-06-10T00:00:00.000Z', city: 'Los Angeles', country: 'USA', stage: 'GROUP', venue: 'SoFi Stadium' },
      },
    ],
    isLoading: false,
  }),
  useDeleteListing: () => ({ mutateAsync: mockDeleteListing }),
}))

vi.mock('@/hooks/useOffers', () => ({
  useMyOffers: () => ({ data: [] }),
  useUpdateOffer: () => ({ mutate: vi.fn() }),
}))

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')
  return {
    ...actual,
    useQuery: () => ({ data: [] }),
  }
})

vi.mock('@/components/listings/ListingGrid', () => ({
  default: () => <div>My listings grid</div>,
}))

vi.mock('@/components/offers/EscrowTracker', () => ({
  default: () => <div>Escrow tracker</div>,
}))

vi.mock('@/components/ui/toaster', () => ({
  toast: vi.fn(),
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sell" element={<div>Create Listing Route</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    mockDeleteListing.mockResolvedValue({})
  })

  it('navigates to /sell from new listing action', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /new listing/i }))
    expect(screen.getByText('Create Listing Route')).toBeInTheDocument()
  })

  it('calls delete when trash button is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /delete listing/i }))
    expect(mockDeleteListing).toHaveBeenCalledWith('listing-1')
  })
})

