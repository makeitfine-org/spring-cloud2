import { render, screen } from '@testing-library/react'
import ErrorBanner from './ErrorBanner'

describe('ErrorBanner', () => {
  it('returns null when no error prop is provided', () => {
    const { container } = render(<ErrorBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when error is falsy', () => {
    const { container } = render(<ErrorBanner error={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows title and message when error is a string', () => {
    render(<ErrorBanner error="Something went wrong" title="My Title" />)
    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('uses default title "Error" when title not provided', () => {
    render(<ErrorBanner error="oops" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('extracts error.data.message from RTK Query error object', () => {
    const rtkError = { data: { message: 'Server error detail' } }
    render(<ErrorBanner error={rtkError} title="RTK Error" />)
    expect(screen.getByText('Server error detail')).toBeInTheDocument()
  })

  it('extracts error.error as fallback', () => {
    const rtkError = { error: 'Network error' }
    render(<ErrorBanner error={rtkError} />)
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })
})
