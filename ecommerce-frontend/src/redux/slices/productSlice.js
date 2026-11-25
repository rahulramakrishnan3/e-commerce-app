import { createSlice } from '@reduxjs/toolkit'
import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct,
} from '../thunks/productThunks.js'

const initialState = {
  items: [],
  selectedProduct: null,
  pagination: null,
  listStatus: 'idle',
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
