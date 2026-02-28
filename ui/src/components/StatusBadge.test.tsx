import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="PENDING" />)
    expect(screen.getByText('PENDING')).toBeInTheDocument()
  })

  it('applies yellow classes for PENDING order status', () => {
    render(<StatusBadge status="PENDING" />)
    const badge = screen.getByText('PENDING')
    expect(badge.className).toContain('bg-yellow-100')
    expect(badge.className).toContain('text-yellow-800')
  })

  it('applies green classes for CONFIRMED order status', () => {
    render(<StatusBadge status="CONFIRMED" />)
    const badge = screen.getByText('CONFIRMED')
    expect(badge.className).toContain('bg-green-100')
    expect(badge.className).toContain('text-green-800')
  })

  it('applies indigo classes for SCHEDULED delivery status', () => {
    render(<StatusBadge status="SCHEDULED" type="delivery" />)
    const badge = screen.getByText('SCHEDULED')
    expect(badge.className).toContain('bg-indigo-100')
    expect(badge.className).toContain('text-indigo-800')
  })

  it('applies gray fallback for unknown status', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />)
    const badge = screen.getByText('UNKNOWN_STATUS')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-800')
  })
})
