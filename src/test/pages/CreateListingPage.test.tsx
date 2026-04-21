import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CreateListingPage from '@/pages/CreateListingPage'

const mockMutateAsync = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'seller-1' },
    loading: false,
  }),
}))

vi.mock('@/hooks/useListings', () => ({
  useCreateListing: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('@/components/matches/MatchSearch', () => ({
  default: ({ onSelect }: { onSelect: (match: { id: string }) => void }) => (
    <button type="button" onClick={() => onSelect({ id: 'match-1' })}>
      Pick match
    </button>
  ),
}))

vi.mock('@/components/ui/toaster', () => ({
  toast: vi.fn(),
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/sell']}>
        <Routes>
          <Route path="/sell" element={<CreateListingPage />} />
          <Route path="/listings/:id" element={<div>Listing Detail Route</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CreateListingPage', () => {
  beforeEach(() => {
    mockMutateAsync.mockResolvedValue({ id: 'new-listing-1' })
  })

  it('creates listing and navigates to listing detail page', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /pick match/i }))
    await user.type(screen.getByLabelText(/section/i), '101')
    await user.type(screen.getByLabelText(/^row/i), 'A')
    await user.type(screen.getByLabelText(/seat/i), '12')

    await user.click(screen.getByRole('button', { name: /post listing/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          seller_id: 'seller-1',
          match_id: 'match-1',
          section: '101',
          row_label: 'A',
          seat_number: '12',
        }),
      )
    })

    await screen.findByText('Listing Detail Route')
  })
})
