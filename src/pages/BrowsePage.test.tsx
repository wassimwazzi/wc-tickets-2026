import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import BrowsePage from './BrowsePage'

vi.mock('@/hooks/useListings', () => ({
  useListings: () => ({
    data: [
      {
        id: 'listing-1',
        status: 'available',
        category: 1,
        section: '101',
        row_label: 'A',
        seat_number: '12',
        quantity: 1,
        price: 250,
        currency: 'USD',
        created_at: '2026-04-21T00:00:00.000Z',
        match: {
          team1: 'USA',
          team2: 'Canada',
          team1_code: 'US',
          team2_code: 'CA',
          city: 'Los Angeles',
          match_date: '2026-06-11T00:00:00.000Z',
        },
        seller: {
          full_name: 'Alex Seller',
          reputation_score: 4.7,
          total_reviews: 14,
        },
      },
    ],
    isLoading: false,
  }),
}))

describe('BrowsePage', () => {
  it('links each listing card to /listings/:id', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>,
    )

    const listingLink = screen.getByRole('link', { name: /section 101/i })
    expect(listingLink).toHaveAttribute('href', '/listings/listing-1')
  })
})
