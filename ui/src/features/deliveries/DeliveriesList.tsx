import { useGetDeliveriesQuery } from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

function formatDate(ts: string | undefined) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export default function DeliveriesList() {
  const { data: deliveries, error, isLoading } = useGetDeliveriesQuery(undefined, {
    pollingInterval: 5000,
  })

  const sorted = [...(deliveries ?? [])].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Deliveries</h1>
        <p className="text-sm text-slate-500 mt-0.5">Auto-refreshes every 5s</p>
      </div>

      <ErrorBanner error={error} title="Could not load deliveries" />

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Scheduled At</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">Loading…</td>
                </tr>
              )}
              {!isLoading && sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">No deliveries yet</td>
                </tr>
              )}
              {sorted.map((delivery) => (
                <tr key={delivery.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3 text-slate-300 font-mono text-xs">{delivery.id}</td>
                  <td className="px-5 py-3 text-slate-300 font-mono text-xs">{delivery.orderId}</td>
                  <td className="px-5 py-3 text-slate-200">{delivery.productId}</td>
                  <td className="px-5 py-3 text-slate-200">{delivery.quantity}</td>
                  <td className="px-5 py-3"><StatusBadge status={delivery.status} type="delivery" /></td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(delivery.scheduledAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
