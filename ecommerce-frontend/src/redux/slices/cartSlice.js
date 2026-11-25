import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [] }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const { product, quantity = 1, size = '', color = '' } = action.payload
      const productId = String(product?._id || product?.id || '')
      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return
      }

      const lineId = `${productId}:${size}:${color}`
      const existing = state.items.find((item) => item.lineId === lineId)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ lineId, productId, product, quantity, size, color })
      }
    },
    setItemQuantity(state, action) {
      const { lineId, quantity } = action.payload
      const item = state.items.find((cartItem) => cartItem.lineId === lineId)
      if (item && Number.isInteger(quantity) && quantity > 0) {
        item.quantity = quantity
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter(
        (item) => item.lineId !== action.payload,
      )
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addItem, clearCart, removeItem, setItemQuantity } =
  cartSlice.actions
export const selectCartItems = (state) => state.cart.items
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0)
export const selectCartSubtotal = (state) =>
  Math.round(
    state.cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    ) * 100,
  ) / 100
export default cartSlice.reducer
