import { createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance.js'
import { clearCart } from '../slices/cartSlice.js'
import { getApiError } from './apiError.js'

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/orders')
      return data.orders
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/orders/${orderId}`)
      return data.order
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const placeOrder = createAsyncThunk(
  'orders/place',
  async (orderDetails, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/orders', orderDetails)
      dispatch(clearCart())
      return data.order
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/orders/${orderId}/status`,
        { status },
      )
      return data.order
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)
