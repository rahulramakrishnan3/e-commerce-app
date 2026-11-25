import { createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance.js'
import { getApiError } from './apiError.js'

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/products', { params })
      return data
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const fetchRecommendations = createAsyncThunk(
  'products/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/analytics/recommendations')
      return {
        products: data.recommendations,
        source: data.source,
      }
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/products/${productId}`)
      return data.product
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const createProduct = createAsyncThunk(
  'products/create',
  async (product, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/products', product)
      return data.product
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const createProducts = createAsyncThunk(
  'products/createMany',
  async (products, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/products/bulk', products)
      return data
    } catch (error) {
      return rejectWithValue({
        message: getApiError(error),
        errors: error.response?.data?.errors || [],
      })
    }
  },
)

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, updates }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/products/${productId}`,
        updates,
      )
      return data.product
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${productId}`)
      return productId
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)
