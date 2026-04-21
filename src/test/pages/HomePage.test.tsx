import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import HomePage from '@/pages/HomePage'

vi.mock('@/hooks/useListings', () => ({
  useListings: () => ({
    data: [{ id: 'listing-1' }, { id: 'listing-2' }],
    isLoading: false,
  }),
}))

vi.mock('@/components/listings/ListingGrid', () => ({
  default: ({ listings }: { listings: unknown[] }) => <div>Listing grid size: {listings.length}</div>,
}))

describe('HomePage', () => {
  it('exposes primary CTAs and stage browse links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /browse tickets/i })).toHaveAttribute('href', '/browse')
    expect(screen.getByRole('link', { name: /sell tickets/i })).toHaveAttribute('href', '/sell')
    expect(screen.getByRole('link', { name: /group stage/i })).toHaveAttribute('href', '/browse?stage=GROUP')
    expect(screen.getByText('Listing grid size: 2')).toBeInTheDocument()
  })
})
