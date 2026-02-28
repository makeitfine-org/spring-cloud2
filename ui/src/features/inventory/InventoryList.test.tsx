import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import InventoryList from './InventoryList'
import type { InventoryItem } from '../../types'

const mockInventory: InventoryItem[] = [
  { productId: 'prod-1', quantity: 100, reservedQuantity: 10, availableQuantity: 90 },
  { productId: 'prod-2', quantity: 50, reservedQuantity: 50, availableQuantity: 0 },
]

vi.mock('../../services/api', () => ({
  useGetInventoryQuery: vi.fn(),
  api: {
    reducerPath: 'api',
    reducer: () => ({}),
    middleware: () => (next: unknown) => (action: unknown) => next,
  },
}))

import { useGetInventoryQuery } from '../../services/api'

const mockUseGetInventoryQuery = vi.mocked(useGetInventoryQuery)

describe('InventoryList', () => {
  it('shows loading state', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetInventoryQuery.mockReturnValue({ data: undefined, error: undefined, isLoading: true } as any)
    renderWithProviders(<InventoryList />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows "No inventory data" when empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetInventoryQuery.mockReturnValue({ data: [], error: undefined, isLoading: false } as any)
    renderWithProviders(<InventoryList />)
    expect(screen.getByText('No inventory data')).toBeInTheDocument()
  })

  it('renders rows with productId, quantity, reserved, available', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetInventoryQuery.mockReturnValue({ data: mockInventory, error: undefined, isLoading: false } as any)
    renderWithProviders(<InventoryList />)
    expect(screen.getByText('prod-1')).toBeInTheDocument()
    expect(screen.getByText('prod-2')).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('available qty is green when > 0 and red when 0', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseGetInventoryQuery.mockReturnValue({ data: mockInventory, error: undefined, isLoading: false } as any)
    renderWithProviders(<InventoryList />)
    expect(screen.getByText('90').className).toContain('text-green-400')
    expect(screen.getByText('0').className).toContain('text-red-400')
  })
})
