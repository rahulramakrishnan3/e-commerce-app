import { FiMinus, FiPlus, FiX } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  removeItem,
  selectCartItems,
  selectCartSubtotal,
  setItemQuantity,
} from '../redux/slices/cartSlice.js'
import { formatCurrency } from '../utils/formatCurrency.js'

function Cart() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)
  const isAuthenticated = useSelector(
    (state) => Boolean(state.auth.token && state.auth.user),
  )

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
          Your selection
        </p>
        <h1 className="mt-4 font-serif text-4xl text-[#292b25]">Your bag is empty.</h1>
        <p className="mt-4 text-[#66645b]">
          Take a look at the collection and find a piece to make your own.
        </p>
        <Link
          className="mt-8 inline-flex min-h-12 items-center bg-[#526553] px-7 text-sm font-medium text-white hover:bg-[#3f5040]"
          to="/shop"
        >
          Explore the collection
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
        Your selection
      </p>
      <h1 className="mt-3 font-serif text-4xl text-[#292b25] sm:text-5xl">
        Your bag
      </h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
        <div className="divide-y divide-[#e9e6de] border-y border-[#e9e6de]">
          {items.map((item) => {
            const productQuantity = items
              .filter((cartItem) => cartItem.productId === item.productId)
              .reduce((total, cartItem) => total + cartItem.quantity, 0)
            const otherProductQuantity = productQuantity - item.quantity
            return (
              <article
                className="flex gap-4 py-5 sm:gap-6"
                key={item.lineId}
              >
                <Link
                  aria-label={`View ${item.product.name}`}
                  className="h-28 w-24 shrink-0 overflow-hidden bg-[#e8e8df] sm:h-36 sm:w-28"
                  to={`/products/${item.productId}`}
                >
                  {item.product.images?.[0] ? (
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={item.product.images[0]}
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-[#e7e5d9] to-[#c9d2c4]" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#858176]">
                      {item.product.category}
                    </p>
                    <Link
                      className="mt-1 inline-block font-serif text-lg text-[#292b25] hover:text-[#526553]"
                      to={`/products/${item.productId}`}
                    >
                      {item.product.name}
                    </Link>
                    {(item.size || item.color) && (
                      <p className="mt-1 text-xs text-[#77746b]">
                        {[item.size, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-[#34362f]">
                      {formatCurrency(item.product.price)}
                    </p>
                    <div className="mt-3 inline-flex min-h-9 items-center border border-[#d9d6cd]">
                      <button
                        aria-label={`Decrease ${item.product.name} quantity`}
                        className="px-2 py-2 text-[#526553] disabled:text-[#aaa79e]"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          dispatch(
                            setItemQuantity({
                              lineId: item.lineId,
                              quantity: item.quantity - 1,
                            }),
                          )
                        }
                        type="button"
                      >
                        <FiMinus aria-hidden="true" size={12} />
                      </button>
                      <span className="min-w-7 text-center text-xs">
                        {item.quantity}
                      </span>
                      <button
                        aria-label={`Increase ${item.product.name} quantity`}
                        className="px-2 py-2 text-[#526553] disabled:text-[#aaa79e]"
                        disabled={productQuantity >= item.product.stock}
                        onClick={() =>
                          dispatch(
                            setItemQuantity({
                              lineId: item.lineId,
                              quantity: item.quantity + 1,
                            }),
                          )
                        }
                        type="button"
                      >
                        <FiPlus aria-hidden="true" size={12} />
                      </button>
                    </div>
                    {productQuantity > item.product.stock && (
                      <p className="mt-2 text-xs text-[#8b3c2d]" role="alert">
                        Only{' '}
                        {Math.max(0, item.product.stock - otherProductQuantity)}{' '}
                        more available for this piece.
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between">
                    <button
                      aria-label={`Remove ${item.product.name} from bag`}
                      className="p-1 text-[#77746b] hover:text-[#8b3c2d]"
                      onClick={() => dispatch(removeItem(item.lineId))}
                      type="button"
                    >
                      <FiX aria-hidden="true" size={18} />
                    </button>
                    <p className="text-sm font-medium text-[#34362f]">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="h-fit bg-[#f2f1eb] p-6">
          <h2 className="font-serif text-2xl text-[#292b25]">Order summary</h2>
          <div className="mt-6 flex justify-between text-sm text-[#625f57]">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-3 flex justify-between text-sm text-[#625f57]">
            <span>Shipping</span>
            <span>Complimentary</span>
          </div>
          <div className="mt-5 flex justify-between border-t border-[#d9d6cd] pt-5 font-medium text-[#292b25]">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {isAuthenticated ? (
            <Link
              className="mt-6 flex min-h-12 items-center justify-center bg-[#526553] px-5 text-sm font-medium text-white hover:bg-[#3f5040]"
              to="/checkout"
            >
              Continue to checkout
            </Link>
          ) : (
            <Link
              className="mt-6 flex min-h-12 items-center justify-center bg-[#526553] px-5 text-sm font-medium text-white hover:bg-[#3f5040]"
              state={{ from: { pathname: '/checkout' } }}
              to="/login"
            >
              Sign in to checkout
            </Link>
          )}
          <Link
            className="mt-4 block text-center text-sm text-[#526553] underline-offset-4 hover:underline"
            to="/shop"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  )
}

export default Cart
