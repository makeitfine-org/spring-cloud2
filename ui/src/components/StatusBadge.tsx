interface StatusBadgeProps {
  status: string
  type?: 'order' | 'delivery'
}

const ORDER_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  INVENTORY_RESERVED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const DELIVERY_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const palette = type === 'delivery' ? DELIVERY_COLORS : ORDER_COLORS
  const classes = palette[status] ?? 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {status}
    </span>
  )
}
