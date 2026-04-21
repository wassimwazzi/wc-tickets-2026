import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BrowsePage from '@/pages/BrowsePage'

// Two listings: different teams, stages, countries
const MOCK_LISTINGS = [
  {
    id: 'listing-usa',
    status: 'available',
    category: 1,
    section: '101',
    row_label: 'A',
    seat_number: '12',
    quantity: 1,
    price: 250,
    currency: 'USD',
    created_at: '2026-06-01T00:00:00.000Z',
    match: {
      id: 'match-1',
      team1: 'USA',
      team2: 'Canada',
      team1_code: 'US',
      team2_code: 'CA',
      stage: 'GROUP',
      city: 'Los Angeles',
      country: 'United States',
      venue: 'SoFi Stadium',
      match_date: '2026-06-11T00:00:00.000Z',
    },
    seller: { full_name: 'Alex', reputation_score: 4.7, total_reviews: 14 },
  },
  {
    id: 'listing-mexico',
    status: 'available',
    category: 3,
    section: '202',
    row_label: 'B',
    seat_number: '5',
    quantity: 2,
    price: 120,
    currency: 'USD',
    created_at: '2026-05-20T00:00:00.000Z',
    match: {
      id: 'match-2',
      team1: 'Brazil',
      team2: 'Argentina',
      team1_code: 'BR',
      team2_code: 'AR',
      stage: 'QF',
      city: 'Mexico City',
      country: 'Mexico',
      venue: 'Estadio Azteca',
      match_date: '2026-07-01T00:00:00.000Z',
    },
    seller: { full_name: 'Maria', reputation_score: 4.2, total_reviews: 5 },
  },
]

vi.mock('@/hooks/useListings', () => ({
  useListings: () => ({
    data: MOCK_LISTINGS,
    isLoading: false,
  }),
}))

function renderBrowse(initialUrl = '/browse') {
  return render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route path="/browse" element={<BrowsePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BrowsePage', () => {
  it('shows all listings by default', () => {
    renderBrowse()
    expect(screen.getByTestId("results-count")).toHaveTextContent("2 listings found")
    // Both listing links exist
    expect(screen.getByRole('link', { name: /section 101/i })).toHaveAttribute('href', '/listings/listing-usa')
    expect(screen.getByRole('link', { name: /section 202/i })).toHaveAttribute('href', '/listings/listing-mexico')
  })

  it('filters by text search (team name)', async () => {
    renderBrowse()
    const searchInput = screen.getByTestId('search-input')
    await userEvent.type(searchInput, 'USA')
    expect(screen.getByTestId("results-count")).toHaveTextContent("1 listing found")
    expect(screen.getByRole('link', { name: /section 101/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /section 202/i })).not.toBeInTheDocument()
  })

  it('filters by text search (city)', async () => {
    renderBrowse()
    await userEvent.type(screen.getByTestId('search-input'), 'Mexico City')
    expect(screen.getByTestId("results-count")).toHaveTextContent("1 listing found")
    expect(screen.getByRole('link', { name: /section 202/i })).toBeInTheDocument()
  })

  it('clears text search with X button', async () => {
    renderBrowse()
    const input = screen.getByTestId('search-input')
    await userEvent.type(input, 'USA')
    expect(screen.getByTestId("results-count")).toHaveTextContent("1 listing found")

    await userEvent.click(screen.getByRole('button', { name: /clear search/i }))
    expect(screen.getByTestId("results-count")).toHaveTextContent("2 listings found")
  })

  it('filters by stage chip click', async () => {
    renderBrowse()
    await userEvent.click(screen.getByTestId('stage-chip-QF'))
    expect(screen.getByTestId("results-count")).toHaveTextContent("1 listing found")
    expect(screen.getByRole('link', { name: /section 202/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /section 101/i })).not.toBeInTheDocument()
  })

  it('toggles stage chip off to show all results', async () => {
    renderBrowse()
    await userEvent.click(screen.getByTestId('stage-chip-QF'))
    expect(screen.getByTestId("results-count")).toHaveTextContent("1 listing found")
    await userEvent.click(screen.getByTestId('stage-chip-QF'))
    expect(screen.getByTestId("results-count")).toHaveTextContent("2 listings found")
  })

  it('filters by location chip', async () => {
    renderBrowse()
    await userEvent.click(screen.getByTestId('location-chip-Mexico'))
    expect(screen.getByTestId("results-count")).toHaveTextContent("1 listing found")
    expect(screen.getByRole('link', { name: /section 202/i })).toBeInTheDocument()
  })

  it('shows no results message when filters match nothing', async () => {
    renderBrowse()
    await userEvent.type(screen.getByTestId('search-input'), 'zzznomatch')
    expect(screen.getByText(/no tickets found/i)).toBeInTheDocument()
  })

  it('shows active filter chips and allows clearing them', async () => {
    renderBrowse()
    await userEvent.click(screen.getByTestId('stage-chip-GROUP'))

    // Active chip should appear
    expect(screen.getByText(/stage: group stage/i)).toBeInTheDocument()

    // Click X on the chip to remove it
    await userEvent.click(screen.getByRole('button', { name: /remove stage: group stage filter/i }))
    expect(screen.getByTestId("results-count")).toHaveTextContent("2 listings found")
  })

  it('reads stage from URL params on mount', () => {
    renderBrowse('/browse?stage=QF')
    expect(screen.getByTestId("results-count")).toHaveTextContent("1 listing found")
  })

  it('combines text search and stage filter', async () => {
    renderBrowse()
    // Filter by QF stage — should show Mexico listing
    await userEvent.click(screen.getByTestId('stage-chip-QF'))
    // Text search for Brazil within QF
    await userEvent.type(screen.getByTestId('search-input'), 'Brazil')
    expect(screen.getByTestId("results-count")).toHaveTextContent("1 listing found")
    // Now search for something not in QF
    await userEvent.clear(screen.getByTestId('search-input'))
    await userEvent.type(screen.getByTestId('search-input'), 'USA')
    expect(screen.getByTestId("results-count")).toHaveTextContent("0 listings found")
  })
})
