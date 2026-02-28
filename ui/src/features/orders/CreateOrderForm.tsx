import { useState } from 'react'
import { useCreateOrderMutation } from '../../services/api'
import ErrorBanner from '../../components/ErrorBanner'

interface CreateOrderFormProps {
  onClose: () => void
}

export default function CreateOrderForm({ onClose }: CreateOrderFormProps) {
  const [form, setForm] = useState({ productId: '', quantity: '', price: '' })
  const [createOrder, { isLoading, error }] = useCreateOrderMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createOrder({
        productId: form.productId,
        quantity: parseInt(form.quantity, 10),
        price: parseFloat(form.price),
      }).unwrap()
      onClose()
    } catch {
      // error displayed via ErrorBanner
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Create Order</h2>
        <ErrorBanner error={error} title="Failed to create order" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Product ID</label>
            <input
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
              placeholder="e.g. prod-1"
              className="w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              placeholder="e.g. 5"
              className="w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
              placeholder="e.g. 29.99"
              className="w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              {isLoading ? 'Creating…' : 'Create Order'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
