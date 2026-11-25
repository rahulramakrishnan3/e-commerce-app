import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ProductCard from '../components/products/ProductCard.jsx'
import { fetchProducts } from '../redux/thunks/productThunks.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

const pageSize = 12

const getQueryParams = (page, filters) => {
  const [sort, order] = filters.sort.split(':')
  const params = { page, limit: pageSize, sort, order }
  if (filters.search) params.search = filters.search
  if (filters.category) params.category = filters.category
  if (filters.minPrice !== '') params.minPrice = filters.minPrice
  if (filters.maxPrice !== '') params.maxPrice = filters.maxPrice
  return params
}

function Shop() {
  const dispatch = useDispatch()
  const { items, listStatus, error, pagination } = useSelector(
    (state) => state.products,
  )
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt:desc',
  })
  const [filterError, setFilterError] = useState('')

  useEffect(() => {
    dispatch(fetchProducts(getQueryParams(page, filters)))
  }, [dispatch, filters, page])

  const submitFilters = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextFilters = Object.fromEntries(formData.entries())
    nextFilters.search = nextFilters.search.trim()
    nextFilters.category = nextFilters.category.trim()
    if (
      nextFilters.minPrice !== '' &&
      nextFilters.maxPrice !== '' &&
      Number(nextFilters.minPrice) > Number(nextFilters.maxPrice)
    ) {
      setFilterError('Minimum price cannot be greater than maximum price.')
      return
    }
    setFilterError('')
    setPage(1)
    setFilters(nextFilters)
  }

  const totalPages = Math.max(pagination?.pages || 1, 1)

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
          The collection
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#292b25] sm:text-5xl">
          Pieces to live in.
        </h1>
        <p className="mt-4 leading-7 text-[#66645b]">
          Soft, considered clothing for the moments that make up your day.
        </p>
      </div>

      <form
        className="mb-9 grid gap-4 border-y border-[#e9e6de] py-5 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={submitFilters}
      >
        <label className="text-xs font-medium text-[#625f57]">
          Search
          <input
            className="mt-2 min-h-11 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            defaultValue={filters.search}
            name="search"
            placeholder="Try cardigan or cotton"
            type="search"
          />
        </label>
        <label className="text-xs font-medium text-[#625f57]">
          Category
          <input
            className="mt-2 min-h-11 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            defaultValue={filters.category}
            name="category"
            placeholder="e.g. Knitwear"
            type="text"
          />
        </label>
        <label className="text-xs font-medium text-[#625f57]">
          Minimum price
          <input
            className="mt-2 min-h-11 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            defaultValue={filters.minPrice}
            min="0"
            name="minPrice"
            type="number"
          />
        </label>
        <label className="text-xs font-medium text-[#625f57]">
          Maximum price
          <input
            className="mt-2 min-h-11 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            defaultValue={filters.maxPrice}
            min="0"
            name="maxPrice"
            type="number"
          />
        </label>
        <div className="flex flex-col justify-end gap-2 sm:flex-row lg:flex-col">
          <label className="sr-only" htmlFor="shop-sort">
            Sort products
          </label>
          <select
            className="min-h-11 border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            defaultValue={filters.sort}
            id="shop-sort"
            name="sort"
          >
            <option value="createdAt:desc">Newest</option>
            <option value="price:asc">Price: low to high</option>
            <option value="price:desc">Price: high to low</option>
            <option value="name:asc">Name: A to Z</option>
          </select>
          <button
            className="min-h-11 bg-[#526553] px-5 text-sm font-medium text-white hover:bg-[#3f5040]"
            type="submit"
          >
            Apply filters
          </button>
        </div>
      </form>

      {filterError && (
        <p className="mb-6 bg-[#f7ebe7] p-4 text-sm text-[#8b3c2d]" role="alert">
          {filterError}
        </p>
      )}
      {listStatus === 'loading' && (
        <p aria-live="polite" className="py-12 text-center text-sm text-[#625f57]">
          Loading the collection...
        </p>
      )}
      {listStatus === 'failed' && (
        <div className="bg-[#f7ebe7] p-5 text-sm text-[#8b3c2d]" role="alert">
          <p>{getErrorMessage(error, 'The collection could not be loaded.')}</p>
          <button
            className="mt-3 underline underline-offset-4"
            onClick={() =>
              dispatch(fetchProducts(getQueryParams(page, filters)))
            }
            type="button"
          >
            Try again
          </button>
        </div>
      )}
      {listStatus === 'succeeded' && items.length === 0 && (
        <p className="py-12 text-center text-[#625f57]">
          No pieces match those filters. Try a broader search.
        </p>
      )}
      {listStatus === 'succeeded' && items.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {pagination?.pages > 1 && (
        <nav
          aria-label="Product pages"
          className="mt-12 flex items-center justify-center gap-5"
        >
          <button
            className="px-3 py-2 text-sm text-[#526553] disabled:text-[#aaa79e]"
            disabled={page <= 1 || listStatus === 'loading'}
            onClick={() => setPage((current) => current - 1)}
            type="button"
          >
            Previous
          </button>
          <span aria-live="polite" className="text-sm text-[#625f57]">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-2 text-sm text-[#526553] disabled:text-[#aaa79e]"
            disabled={page >= totalPages || listStatus === 'loading'}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  )
}

export default Shop
