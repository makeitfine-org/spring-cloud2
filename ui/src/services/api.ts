import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Order, InventoryItem, Delivery, CreateOrderRequest } from '../types'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Order', 'Inventory', 'Delivery'],
  endpoints: (builder) => ({
    // Orders
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    // Inventory
    getInventory: builder.query<InventoryItem[], void>({
      query: () => '/inventory',
      providesTags: ['Inventory'],
    }),
    getInventoryByProduct: builder.query<InventoryItem, string>({
      query: (productId) => `/inventory/${productId}`,
      providesTags: (_result, _error, productId) => [{ type: 'Inventory', id: productId }],
    }),

    // Deliveries
    getDeliveries: builder.query<Delivery[], void>({
      query: () => '/deliveries',
      providesTags: ['Delivery'],
    }),
    getDeliveryByOrderId: builder.query<Delivery, number>({
      query: (orderId) => `/deliveries/order/${orderId}`,
      providesTags: (_result, _error, orderId) => [{ type: 'Delivery', id: orderId }],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useGetInventoryQuery,
  useGetInventoryByProductQuery,
  useGetDeliveriesQuery,
  useGetDeliveryByOrderIdQuery,
} = api
