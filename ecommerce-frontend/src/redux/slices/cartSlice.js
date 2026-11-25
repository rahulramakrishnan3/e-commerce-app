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

      const currentProductQuantity = state.items
        .filter((item) => item.productId === productId)
        .reduce((total, item) => total + item.quantity, 0)
      const remainingStock =
        typeof product.stock === 'number' && Number.isFinite(product.stock)
          ? Math.max(0, product.stock - currentProductQuantity)
          : quantity
      const acceptedQuantity = Math.min(quantity, remainingStock)
      if (acceptedQuantity < 1) {
        return
      }

      const lineId = `${productId}:${size}:${color}`
      const existing = state.items.find((item) => item.lineId === lineId)
      if (existing) {
        existing.quantity += acceptedQuantity
      } else {
        state.items.push({
          lineId,
          productId,
          product,
          quantity: acceptedQuantity,
          size,
          color,
        })
      }
    },
    setItemQuantity(state, action) {
      const { lineId, quantity } = action.payload
      const item = state.items.find((cartItem) => cartItem.lineId === lineId)
      if (item && Number.isInteger(quantity) && quantity > 0) {
        const otherProductQuantity = state.items
          .filter(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.lineId !== item.lineId,
          )
          .reduce((total, cartItem) => total + cartItem.quantity, 0)
        const remainingStock =
          typeof item.product.stock === 'number' &&
          Number.isFinite(item.product.stock)
            ? item.product.stock - otherProductQuantity
            : quantity
        if (remainingStock > 0) {
          item.quantity = Math.min(quantity, remainingStock)
        }
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
