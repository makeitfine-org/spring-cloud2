import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import CreateOrderForm from './CreateOrderForm'

const mockCreateOrder = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) }))

vi.mock('../../services/api', () => ({
  useCreateOrderMutation: () => [mockCreateOrder, { isLoading: false, error: undefined }],
  api: {
    reducerPath: 'api',
    reducer: () => ({}),
    middleware: () => (next: unknown) => (_action: unknown) => next,
  },
}))

describe('CreateOrderForm', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all three input fields', () => {
    renderWithProviders(<CreateOrderForm onClose={onClose} />)
    expect(screen.getByPlaceholderText('e.g. prod-1')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 5')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 29.99')).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    renderWithProviders(<CreateOrderForm onClose={onClose} />)
    expect(screen.getByRole('button', { name: /create order/i })).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', async () => {
    renderWithProviders(<CreateOrderForm onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls createOrder with form data on submit', async () => {
    renderWithProviders(<CreateOrderForm onClose={onClose} />)

    await userEvent.type(screen.getByPlaceholderText('e.g. prod-1'), 'prod-1')
    await userEvent.type(screen.getByPlaceholderText('e.g. 5'), '3')
    await userEvent.type(screen.getByPlaceholderText('e.g. 29.99'), '19.99')
    await userEvent.click(screen.getByRole('button', { name: /create order/i }))

    expect(mockCreateOrder).toHaveBeenCalledWith({
      productId: 'prod-1',
      quantity: 3,
      price: 19.99,
    })
  })
})
