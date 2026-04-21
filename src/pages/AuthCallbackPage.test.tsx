import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AuthCallbackPage from './AuthCallbackPage'

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  exchangeCodeForSessionMock: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
  }
})

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSessionMock,
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}))

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exchanges OAuth code and redirects to home', async () => {
    mocks.exchangeCodeForSessionMock.mockResolvedValue({})
    window.history.pushState({}, '', '/auth/callback?code=abc123')

    render(
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(mocks.exchangeCodeForSessionMock).toHaveBeenCalledWith('?code=abc123')
      expect(mocks.navigateMock).toHaveBeenCalledWith('/')
    })
  })
})
