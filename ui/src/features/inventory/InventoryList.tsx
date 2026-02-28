import { useGetInventoryQuery } from '../../services/api'
import ErrorBanner from '../../components/ErrorBanner'

export default function InventoryList() {
  const { data: inventory, error, isLoading } = useGetInventoryQuery()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-sm text-slate-500 mt-0.5">Read-only · stock is managed by the saga</p>
      </div>

      <ErrorBanner error={error} title="Could not load inventory" />

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="px-5 py-3 font-medium">Product ID</th>
                <th className="px-5 py-3 font-medium">Total Qty</th>
                <th className="px-5 py-3 font-medium">Reserved</th>
                <th className="px-5 py-3 font-medium">Available</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">Loading…</td>
                </tr>
              )}
              {!isLoading && (!inventory || inventory.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">No inventory data</td>
                </tr>
              )}
              {(inventory ?? []).map((item) => {
                const reserved = item.reservedQuantity ?? 0
                const available = item.availableQuantity ?? (item.quantity - reserved)
                const availableColor = available > 0 ? 'text-green-400' : 'text-red-400'
                return (
                  <tr key={item.productId} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3 text-slate-200 font-medium">{item.productId}</td>
                    <td className="px-5 py-3 text-slate-200">{item.quantity}</td>
                    <td className="px-5 py-3 text-slate-400">{reserved}</td>
                    <td className={`px-5 py-3 font-semibold ${availableColor}`}>{available}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
