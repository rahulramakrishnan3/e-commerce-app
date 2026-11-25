import { createSlice } from '@reduxjs/toolkit'
import { sessionCleared } from './authSlice.js'
import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  fetchRecommendations,
  updateProduct,
} from '../thunks/productThunks.js'

const initialState = {
  items: [],
  recommendations: [],
  recommendationSource: null,
  selectedProduct: null,
  pagination: null,
  listStatus: 'idle',
  recommendationsStatus: 'idle',
  recommendationsError: null,
  detailStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null
      state.detailStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload.products
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(fetchRecommendations.pending, (state) => {
        state.recommendationsStatus = 'loading'
        state.recommendationsError = null
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendationsStatus = 'succeeded'
        state.recommendations = action.payload.products
        state.recommendationSource = action.payload.source
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.recommendationsStatus = 'failed'
        state.recommendationsError = action.payload || action.error.message
      })
      .addCase(sessionCleared, (state) => {
        state.recommendations = []
        state.recommendationSource = null
        state.recommendationsStatus = 'idle'
        state.recommendationsError = null
      })
      .addCase(fetchProductById.pending, (state) => {
        state.detailStatus = 'loading'
        state.selectedProduct = null
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.selectedProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(createProduct.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items = state.items.map((product) =>
          product._id === action.payload._id ? action.payload : product,
        )
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(deleteProduct.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items = state.items.filter(
          (product) => product._id !== action.payload,
        )
        if (state.selectedProduct?._id === action.payload) {
          state.selectedProduct = null
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearSelectedProduct } = productSlice.actions
export const selectProducts = (state) => state.products.items
export const selectProductPagination = (state) => state.products.pagination
export const selectSelectedProduct = (state) => state.products.selectedProduct
export default productSlice.reducer
