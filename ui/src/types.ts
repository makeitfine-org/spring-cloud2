export type OrderStatus = 'PENDING' | 'INVENTORY_RESERVED' | 'CONFIRMED' | 'CANCELLED'
export type DeliveryStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED'

export interface Order {
  id: number
  productId: string
  quantity: number
  price: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  productId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
}

export interface Delivery {
  id: number
  orderId: number
  productId: string
  quantity: number
  status: DeliveryStatus
  scheduledAt: string
}

export interface CreateOrderRequest {
  productId: string
  quantity: number
  price: number
}
