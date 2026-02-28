import { useState } from 'react'
import { useGetOrdersQuery, useGetDeliveryByOrderIdQuery } from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'
import CreateOrderForm from './CreateOrderForm'

function formatDate(ts: string | undefined) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

function OrderDetailRow({ orderId }: { orderId: number }) {
  const { data: delivery, isLoading, error } = useGetDeliveryByOrderIdQuery(orderId)

  if (isLoading) return (
    <tr>
      <td colSpan={7} className="px-8 py-3 text-slate-500 text-xs italic">Loading delivery…</td>
    </tr>
  )

  return (
    <tr className="bg-slate-900/50">
      <td colSpan={7} className="px-8 py-3">
        {error ? (
          <span className="text-slate-500 text-xs">No delivery linked yet</span>
        ) : delivery ? (
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span>Delivery <span className="font-mono text-slate-300">{delivery.id}</span></span>
            <StatusBadge status={delivery.status} type="delivery" />
            {delivery.scheduledAt && <span>Scheduled: {formatDate(delivery.scheduledAt)}</span>}
          </div>
        ) : (
          <span className="text-slate-500 text-xs">No delivery linked yet</span>
        )}
      </td>
    </tr>
  )
}

export default function OrdersList() {
  const { data: orders, error, isLoading } = useGetOrdersQuery(undefined, {
    pollingInterval: 5000,
  })
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const sorted = [...(orders ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const toggleRow = (id: number) => setExpandedId(expandedId === id ? null : id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">Auto-refreshes every 5s · click a row to see delivery</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
        >
          + Create Order
        </button>
      </div>

      <ErrorBanner error={error} title="Could not load orders" />

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">Loading…</td>
                </tr>
              )}
              {!isLoading && sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">No orders yet</td>
                </tr>
              )}
              {sorted.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() => toggleRow(order.id)}
                  >
                    <td className="px-5 py-3 text-slate-300 font-mono text-xs">{order.id}</td>
                    <td className="px-5 py-3 text-slate-200">{order.productId}</td>
                    <td className="px-5 py-3 text-slate-200">{order.quantity}</td>
                    <td className="px-5 py-3 text-slate-200">${order.price?.toFixed(2)}</td>
                    <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(order.updatedAt)}</td>
                  </tr>
                  {expandedId === order.id && <OrderDetailRow key={`detail-${order.id}`} orderId={order.id} />}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <CreateOrderForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
