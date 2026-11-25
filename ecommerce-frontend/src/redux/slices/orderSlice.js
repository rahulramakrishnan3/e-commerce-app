import { createSlice } from '@reduxjs/toolkit'
import {
  fetchOrderById,
  fetchOrders,
  placeOrder,
  updateOrderStatus,
} from '../thunks/orderThunks.js'

const initialState = {
  items: [],
  selectedOrder: null,
  listStatus: 'idle',
  detailStatus: 'idle',
  submitStatus: 'idle',
  updateStatus: 'idle',
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null
      state.detailStatus = 'idle'
    },
    clearOrderError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.detailStatus = 'loading'
        state.selectedOrder = null
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.selectedOrder = action.payload
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(placeOrder.pending, (state) => {
        state.submitStatus = 'loading'
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded'
        state.items.unshift(action.payload)
        state.selectedOrder = action.payload
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.submitStatus = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateStatus = 'loading'
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded'
        state.items = state.items.map((order) =>
          order._id === action.payload._id ? action.payload : order,
        )
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = action.payload
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearOrderError, clearSelectedOrder } = orderSlice.actions
export const selectOrders = (state) => state.orders.items
export const selectSelectedOrder = (state) => state.orders.selectedOrder
export default orderSlice.reducer
