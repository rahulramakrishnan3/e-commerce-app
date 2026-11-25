import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { selectCartItems, selectCartSubtotal } from '../redux/slices/cartSlice.js'
import { clearOrderError } from '../redux/slices/orderSlice.js'
import { placeOrder } from '../redux/thunks/orderThunks.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

const addressFields = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name' },
  { name: 'addressLine1', label: 'Address', autoComplete: 'address-line1' },
  {
    name: 'addressLine2',
    label: 'Apartment, suite, etc. (optional)',
    autoComplete: 'address-line2',
    required: false,
  },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'state', label: 'State / region', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
  { name: 'country', label: 'Country', autoComplete: 'country-name' },
  { name: 'phone', label: 'Phone', autoComplete: 'tel', type: 'tel' },
]

function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)
  const { submitStatus, error } = useSelector((state) => state.orders)

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-serif text-4xl text-[#292b25]">Your bag is empty.</h1>
        <Link className="mt-7 inline-block text-sm text-[#526553] underline" to="/shop">
          Return to the collection
        </Link>
      </section>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(clearOrderError())
    const formData = new FormData(event.currentTarget)
    const formValues = Object.fromEntries(formData.entries())
    const { paymentMethod, ...shippingAddress } = formValues
    const result = await dispatch(
      placeOrder({
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress,
        paymentMethod,
      }),
    )

    if (placeOrder.fulfilled.match(result)) {
      navigate(`/orders/${result.payload._id}`, { replace: true })
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
        Almost yours
      </p>
      <h1 className="mt-3 font-serif text-4xl text-[#292b25] sm:text-5xl">
        Checkout
      </h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <fieldset>
            <legend className="font-serif text-2xl text-[#292b25]">
              Shipping address
            </legend>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {addressFields.map((field) => (
                <label
                  className={`text-xs font-medium text-[#625f57] ${
                    field.name === 'addressLine1' ||
                    field.name === 'addressLine2'
                      ? 'sm:col-span-2'
                      : ''
                  }`}
                  key={field.name}
                >
                  {field.label}
                  <input
                    autoComplete={field.autoComplete}
                    className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
                    name={field.name}
                    required={field.required !== false}
                    type={field.type || 'text'}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-serif text-2xl text-[#292b25]">
              Payment
            </legend>
            <label className="mt-5 flex items-start gap-3 border border-[#d9d6cd] bg-white p-4 text-sm text-[#34362f]">
              <input
                className="mt-1 accent-[#526553]"
                defaultChecked
                name="paymentMethod"
                type="radio"
                value="cash_on_delivery"
              />
              <span>
                <span className="block font-medium">Cash on delivery</span>
                <span className="mt-1 block text-xs text-[#77746b]">
                  Pay when your order arrives. Online card payments are not
                  enabled in this demo.
                </span>
              </span>
            </label>
          </fieldset>

          {error && (
            <p className="bg-[#f7ebe7] p-4 text-sm text-[#8b3c2d]" role="alert">
              {getErrorMessage(error, 'Your order could not be placed.')}
            </p>
          )}
          <button
            className="min-h-12 w-full bg-[#526553] px-7 text-sm font-medium text-white hover:bg-[#3f5040] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            disabled={submitStatus === 'loading'}
            type="submit"
          >
            {submitStatus === 'loading' ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <aside className="h-fit bg-[#f2f1eb] p-6">
          <h2 className="font-serif text-2xl text-[#292b25]">Your order</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li className="flex justify-between gap-4 text-sm" key={item.lineId}>
                <span className="text-[#625f57]">
                  {item.product.name} × {item.quantity}
                  {(item.size || item.color) && (
                    <span className="mt-1 block text-xs text-[#858176]">
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[#34362f]">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between border-t border-[#d9d6cd] pt-5 font-medium text-[#292b25]">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Checkout
