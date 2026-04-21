import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProfilePage from '@/pages/ProfilePage'

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
  useListings: () => ({ data: [], isLoading: false }),
  useDeleteListing: () => ({ mutateAsync: vi.fn() }),
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
  it('navigates to /sell from new listing action', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /new listing/i }))
    expect(screen.getByText('Create Listing Route')).toBeInTheDocument()
  })
})
