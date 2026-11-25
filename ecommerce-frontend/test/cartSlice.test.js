import assert from 'node:assert/strict'
import { test } from 'node:test'
import cartReducer, {
  addItem,
  removeItem,
  selectCartItemCount,
  selectCartSubtotal,
  setItemQuantity,
} from '../src/redux/slices/cartSlice.js'

test('cart tracks variant lines, quantities, and subtotal', () => {
  const product = { _id: 'product-1', price: 19.99, name: 'Knit Top' }
  let state = cartReducer(undefined, { type: 'test/init' })
  state = cartReducer(
    state,
    addItem({ product, quantity: 2, size: 'M', color: 'Navy' }),
  )
  state = cartReducer(
    state,
    addItem({ product, quantity: 1, size: 'M', color: 'Navy' }),
  )
  state = cartReducer(
    state,
    addItem({ product, quantity: 1, size: 'L', color: 'Navy' }),
  )

  assert.equal(selectCartItemCount({ cart: state }), 4)
  assert.equal(selectCartSubtotal({ cart: state }), 79.96)
  assert.equal(state.items.length, 2)

  state = cartReducer(
    state,
    setItemQuantity({ lineId: state.items[0].lineId, quantity: 1 }),
  )
  assert.equal(selectCartItemCount({ cart: state }), 2)
})

test('cart ignores invalid quantities and removes a selected line', () => {
  const product = { _id: 'product-2', price: 25, name: 'Wool Scarf' }
  let state = cartReducer(
    undefined,
    addItem({ product, quantity: 1, size: 'One size', color: 'Olive' }),
  )
  const [item] = state.items

  state = cartReducer(
    state,
    setItemQuantity({ lineId: item.lineId, quantity: 0 }),
  )
  assert.equal(state.items[0].quantity, 1)

  state = cartReducer(state, removeItem(item.lineId))
  assert.equal(state.items.length, 0)
})
