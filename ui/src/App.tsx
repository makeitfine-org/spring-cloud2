import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './features/dashboard/Dashboard'
import OrdersList from './features/orders/OrdersList'
import InventoryList from './features/inventory/InventoryList'
import DeliveriesList from './features/deliveries/DeliveriesList'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="deliveries" element={<DeliveriesList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
