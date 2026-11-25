import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { fetchOrderById, fetchOrders } from '../redux/thunks/orderThunks.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered']

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(date))

function OrderStatus({ status }) {
  if (status === 'cancelled') {
    return (
      <p className="mt-4 inline-block bg-[#f7ebe7] px-3 py-2 text-sm capitalize text-[#8b3c2d]">
        Cancelled
      </p>
    )
  }

  const activeIndex = orderStatuses.indexOf(status)

  return (
    <ol aria-label={`Order status: ${status}`} className="mt-6 grid grid-cols-4">
      {orderStatuses.map((step, index) => (
        <li className="relative text-center" key={step}>
          <span
            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ${
              index <= activeIndex
                ? 'bg-[#526553] text-white'
                : 'bg-[#e5e3dc] text-[#77746b]'
            }`}
          >
            {index + 1}
          </span>
          <span
            className={`mt-2 block text-[10px] capitalize sm:text-xs ${
              index <= activeIndex ? 'text-[#34362f]' : 'text-[#858176]'
            }`}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  )
}

function OrderSummary({ order, detailed = false }) {
  return (
    <article className="border border-[#e9e6de] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#858176]">
            Order
          </p>
          <h2 className="mt-1 break-all font-medium text-[#292b25]">
            #{order._id}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#858176]">Placed {formatDate(order.createdAt)}</p>
          <p className="mt-1 font-medium text-[#34362f]">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>
      <OrderStatus status={order.status} />
      <ul className="mt-6 divide-y divide-[#eeece6] border-y border-[#eeece6]">
        {order.items.map((item, index) => (
          <li className="flex justify-between gap-4 py-3 text-sm" key={`${item.product?._id || item.product}-${index}`}>
            <span className="text-[#625f57]">
              {item.name} × {item.quantity}
              {(item.size || item.color) && (
                <span className="ml-2 text-xs text-[#858176]">
                  {[item.size, item.color].filter(Boolean).join(' · ')}
                </span>
              )}
            </span>
            <span className="shrink-0 text-[#34362f]">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      {detailed && order.shippingAddress && (
        <div className="mt-6 text-sm text-[#625f57]">
          <h3 className="font-medium text-[#34362f]">Shipping to</h3>
          <address className="mt-2 not-italic leading-6">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 && (
              <>
                <br />
                {order.shippingAddress.addressLine2}
              </>
            )}
            <br />
            {[
              order.shippingAddress.city,
              order.shippingAddress.state,
              order.shippingAddress.postalCode,
            ]
              .filter(Boolean)
              .join(', ')}
            <br />
            {order.shippingAddress.country}
          </address>
          <p className="mt-3">
            Payment: {order.paymentMethod?.replaceAll('_', ' ')}
          </p>
        </div>
      )}
      {!detailed && (
        <Link
          className="mt-5 inline-block text-sm text-[#526553] underline-offset-4 hover:underline"
          to={`/orders/${order._id}`}
        >
          View tracking details
        </Link>
      )}
    </article>
  )
}

function Orders() {
  const dispatch = useDispatch()
  const { orderId } = useParams()
  const {
    items,
    selectedOrder,
    listStatus,
    detailStatus,
    error,
  } = useSelector((state) => state.orders)

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId))
    } else {
      dispatch(fetchOrders())
    }
  }, [dispatch, orderId])

  if (orderId) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <Link className="text-sm text-[#526553] hover:underline" to="/orders">
          ← All orders
        </Link>
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-[#526553]">
          Order tracking
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#292b25]">
          Your order journey
        </h1>
        {detailStatus === 'loading' && (
          <p aria-live="polite" className="mt-8 text-sm text-[#625f57]">
            Loading order details...
          </p>
        )}
        {detailStatus === 'failed' && (
          <div className="mt-8 bg-[#f7ebe7] p-5 text-sm text-[#8b3c2d]" role="alert">
            <p>{getErrorMessage(error, 'Order details could not be loaded.')}</p>
            <button
              className="mt-3 underline underline-offset-4"
              onClick={() => dispatch(fetchOrderById(orderId))}
              type="button"
            >
              Try again
            </button>
          </div>
        )}
        {detailStatus === 'succeeded' && selectedOrder && (
          <div className="mt-8">
            <OrderSummary detailed order={selectedOrder} />
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
        Your account
      </p>
      <h1 className="mt-3 font-serif text-4xl text-[#292b25] sm:text-5xl">
        Order history
      </h1>
      {listStatus === 'loading' && (
        <p aria-live="polite" className="mt-8 text-sm text-[#625f57]">
          Loading your orders...
        </p>
      )}
      {listStatus === 'failed' && (
        <div className="mt-8 bg-[#f7ebe7] p-5 text-sm text-[#8b3c2d]" role="alert">
          <p>{getErrorMessage(error, 'Your orders could not be loaded.')}</p>
          <button
            className="mt-3 underline underline-offset-4"
            onClick={() => dispatch(fetchOrders())}
            type="button"
          >
            Try again
          </button>
        </div>
      )}
      {listStatus === 'succeeded' && items.length === 0 && (
        <div className="mt-8 border border-[#e9e6de] p-7 text-center">
          <p className="font-serif text-2xl text-[#292b25]">No orders just yet.</p>
          <Link className="mt-4 inline-block text-sm text-[#526553] underline" to="/shop">
            Browse the collection
          </Link>
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-8 space-y-5">
          {items.map((order) => (
            <OrderSummary key={order._id} order={order} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Orders
