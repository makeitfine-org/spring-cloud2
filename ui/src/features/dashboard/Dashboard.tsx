import { useGetOrdersQuery, useGetInventoryQuery, useGetDeliveriesQuery } from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'
import type { OrderStatus } from '../../types'

interface StatCardProps {
  label: string
  value: number | undefined
  sub?: string
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value ?? '—'}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function formatDate(ts: string | undefined) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export default function Dashboard() {
  const { data: orders, error: ordersError, isLoading: ordersLoading } = useGetOrdersQuery(undefined, {
    pollingInterval: 5000,
  })
  const { data: inventory, error: inventoryError } = useGetInventoryQuery()
  const { data: deliveries, error: deliveriesError } = useGetDeliveriesQuery(undefined, {
    pollingInterval: 5000,
  })

  const ordersByStatus = (orders ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  const totalAvailable = (inventory ?? []).reduce((acc, i) => acc + (i.availableQuantity ?? i.quantity - (i.reservedQuantity ?? 0)), 0)
  const scheduledCount = (deliveries ?? []).filter((d) => d.status === 'SCHEDULED').length
  const recentOrders = [...(orders ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <ErrorBanner error={ordersError} title="Could not load orders" />
      <ErrorBanner error={inventoryError} title="Could not load inventory" />
      <ErrorBanner error={deliveriesError} title="Could not load deliveries" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Orders"
          value={orders?.length}
          sub={ordersLoading ? 'Loading…' : `P:${ordersByStatus['PENDING'] ?? 0} C:${ordersByStatus['CONFIRMED'] ?? 0} X:${ordersByStatus['CANCELLED'] ?? 0}`}
        />
        <StatCard
          label="Inventory Items"
          value={inventory?.length}
          sub={`${totalAvailable} units available`}
        />
        <StatCard
          label="Active Deliveries"
          value={scheduledCount}
          sub="SCHEDULED status"
        />
        <StatCard
          label="Confirmed Orders"
          value={ordersByStatus['CONFIRMED'] ?? 0}
          sub="Successfully fulfilled"
        />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-white">Recent Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">Auto-refreshes every 5s</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    {ordersLoading ? 'Loading…' : 'No orders yet'}
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3 text-slate-300 font-mono text-xs">{order.id}</td>
                  <td className="px-5 py-3 text-slate-200">{order.productId}</td>
                  <td className="px-5 py-3 text-slate-200">{order.quantity}</td>
                  <td className="px-5 py-3"><StatusBadge status={order.status as OrderStatus} /></td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
