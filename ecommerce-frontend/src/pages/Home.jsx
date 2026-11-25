import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard.jsx'
import {
  fetchProducts,
  fetchRecommendations,
} from '../redux/thunks/productThunks.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

function ProductSection({
  title,
  products,
  status,
  error,
  emptyMessage,
  onRetry,
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="mb-8 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
            Knit and Thread
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#292b25] sm:text-4xl">
            {title}
          </h2>
        </div>
        <Link
          className="hidden text-sm text-[#526553] underline-offset-4 hover:underline sm:inline"
          to="/shop"
        >
          View all pieces
        </Link>
      </div>
      {status === 'loading' && (
        <p aria-live="polite" className="py-12 text-sm text-[#625f57]">
          Finding your next favourite...
        </p>
      )}
      {status === 'failed' && (
        <div className="bg-[#f7ebe7] p-4 text-sm text-[#8b3c2d]" role="alert">
          <p>{getErrorMessage(error, 'We could not load the collection.')}</p>
          <button
            className="mt-3 underline underline-offset-4"
            onClick={onRetry}
            type="button"
          >
            Try again
          </button>
        </div>
      )}
      {status === 'succeeded' && products.length === 0 && (
        <p className="py-12 text-sm text-[#625f57]">{emptyMessage}</p>
      )}
      {status === 'succeeded' && products.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

function Home() {
  const dispatch = useDispatch()
  const {
    items,
    listStatus,
    error,
    recommendations,
    recommendationsStatus,
    recommendationsError,
  } = useSelector((state) => state.products)
  const isAuthenticated = useSelector(
    (state) => Boolean(state.auth.token && state.auth.user),
  )

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sort: 'createdAt', order: 'desc' }))
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && recommendationsStatus === 'idle') {
      dispatch(fetchRecommendations())
    }
  }, [dispatch, isAuthenticated, recommendationsStatus])

  const featuredProducts = items
    .filter((product) => product.isFeatured)
    .slice(0, 4)
  const collection = featuredProducts.length
    ? featuredProducts
    : items.slice(0, 4)

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#eeeee7] px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div
          aria-hidden="true"
          className="absolute -right-36 top-1/2 -z-10 h-[430px] w-[430px] -translate-y-1/2 rounded-full bg-[#d9dfd3] sm:right-[6%] sm:h-[600px] sm:w-[600px]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs uppercase tracking-[0.24em] text-[#526553]">
              Thoughtful layers for everyday living
            </p>
            <h1 className="font-serif text-5xl font-medium leading-[1.06] tracking-[-0.035em] text-[#292b25] sm:text-6xl lg:text-7xl">
              Everyday warmth, thoughtfully knit.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#66645b] sm:text-lg">
              Considered essentials and soft layers, made to feel like they
              belong in your everyday.
            </p>
            <Link
              className="mt-9 inline-flex min-h-12 items-center justify-center bg-[#526553] px-7 text-sm font-medium text-white transition-colors hover:bg-[#3f5040] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526553]"
              to="/shop"
            >
              Explore the collection
            </Link>
          </div>
          <div
            aria-hidden="true"
            className="hidden aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#d8d6c9] via-[#dce1d7] to-[#aeb9a8] lg:flex"
          >
            <div className="flex h-[68%] w-[55%] items-center justify-center border border-white/60 bg-[#f7f5ed]/70 text-center">
              <span className="max-w-40 font-serif text-4xl leading-tight text-[#526553]">
                Made for slower days
              </span>
            </div>
          </div>
        </div>
      </section>

      <ProductSection
        emptyMessage="New pieces are on their way. Please check back soon."
        error={error}
        onRetry={() =>
          dispatch(fetchProducts({ limit: 8, sort: 'createdAt', order: 'desc' }))
        }
        products={collection}
        status={listStatus}
        title="The considered collection"
      />

      {isAuthenticated && (
        <div className="bg-[#f2f1eb]">
          <ProductSection
            emptyMessage="We will have more suggestions for you as you explore."
            error={recommendationsError}
            onRetry={() => dispatch(fetchRecommendations())}
            products={recommendations.slice(0, 4)}
            status={recommendationsStatus}
            title="Picked for you"
          />
        </div>
      )}
    </>
  )
}

export default Home
