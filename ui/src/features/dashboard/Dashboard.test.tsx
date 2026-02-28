import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import Dashboard from './Dashboard'
import type { Order } from '../../types'

const mockOrders: Order[] = [
  { id: 1, productId: 'prod-1', quantity: 2, price: 19.99, status: 'CONFIRMED', createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:01:00Z' },
  { id: 2, productId: 'prod-2', quantity: 1, price: 9.99, status: 'PENDING', createdAt: '2026-01-01T11:00:00Z', updatedAt: '2026-01-01T11:00:00Z' },
]

vi.mock('../../services/api', () => ({
  useGetOrdersQuery: vi.fn(),
  useGetInventoryQuery: vi.fn(),
  useGetDeliveriesQuery: vi.fn(),
  api: {
    reducerPath: 'api',
    reducer: () => ({}),
    middleware: () => (next: unknown) => (action: unknown) => next,
  },
}))

import { useGetOrdersQuery, useGetInventoryQuery, useGetDeliveriesQuery } from '../../services/api'

const mockUseGetOrdersQuery = vi.mocked(useGetOrdersQuery)
const mockUseGetInventoryQuery = vi.mocked(useGetInventoryQuery)
const mockUseGetDeliveriesQuery = vi.mocked(useGetDeliveriesQuery)

describe('Dashboard', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetInventoryQuery.mockReturnValue({ data: [], error: undefined, isLoading: false } as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetDeliveriesQuery.mockReturnValue({ data: [], error: undefined, isLoading: false } as any)
  })

  it('renders 4 stat cards', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetOrdersQuery.mockReturnValue({ data: mockOrders, error: undefined, isLoading: false } as any)
    renderWithProviders(<Dashboard />)
    expect(screen.getByText('Total Orders')).toBeInTheDocument()
    expect(screen.getByText('Inventory Items')).toBeInTheDocument()
    expect(screen.getByText('Active Deliveries')).toBeInTheDocument()
    expect(screen.getByText('Confirmed Orders')).toBeInTheDocument()
  })

  it('shows order count', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetOrdersQuery.mockReturnValue({ data: mockOrders, error: undefined, isLoading: false } as any)
    renderWithProviders(<Dashboard />)
    // Total orders = 2 (appears in the stat card value)
    const matches = screen.getAllByText('2')
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows "No orders yet" when orders array is empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetOrdersQuery.mockReturnValue({ data: [], error: undefined, isLoading: false } as any)
    renderWithProviders(<Dashboard />)
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })
})
