import { useEffect, useState } from 'react'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { addItem, selectCartItems } from '../redux/slices/cartSlice.js'
import { clearSelectedProduct } from '../redux/slices/productSlice.js'
import { fetchProductById } from '../redux/thunks/productThunks.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

function ProductDetailContent({ productId }) {
  const dispatch = useDispatch()
  const { selectedProduct: product, detailStatus, error } = useSelector(
    (state) => state.products,
  )
  const cartItems = useSelector(selectCartItems)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    dispatch(fetchProductById(productId))
    return () => dispatch(clearSelectedProduct())
  }, [dispatch, productId])

  if (detailStatus === 'loading' || detailStatus === 'idle') {
    return (
      <p aria-live="polite" className="mx-auto max-w-7xl px-5 py-24 text-[#625f57] sm:px-8">
        Loading product...
      </p>
    )
  }

  if (detailStatus === 'failed' || !product) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <p className="text-sm text-[#8b3c2d]" role="alert">
          {getErrorMessage(error, 'This product could not be found.')}
        </p>
        {detailStatus === 'failed' && (
          <button
            className="mt-5 text-sm text-[#526553] underline underline-offset-4"
            onClick={() => dispatch(fetchProductById(productId))}
            type="button"
          >
            Try again
          </button>
        )}
        <Link className="mt-6 inline-block text-sm text-[#526553] underline" to="/shop">
          Return to the collection
        </Link>
      </section>
    )
  }

  const size = selectedSize || product.sizes?.[0] || ''
  const color = selectedColor || product.colors?.[0] || ''
  const quantityInCart = cartItems
    .filter((item) => item.productId === product._id)
    .reduce((total, item) => total + item.quantity, 0)
  const remainingStock = Math.max(0, product.stock - quantityInCart)
  const updateQuantity = (delta) => {
    setQuantity((current) =>
      Math.min(remainingStock, Math.max(1, current + delta)),
    )
  }

  const handleAddToBag = () => {
    dispatch(addItem({ product, quantity, size, color }))
    setAdded(true)
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-16">
      <div className="aspect-[4/5] overflow-hidden bg-[#e8e8df]">
        {product.images?.[0] ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover"
            src={product.images[0]}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full items-center justify-center bg-gradient-to-br from-[#e7e5d9] via-[#dce1d7] to-[#c9d2c4] font-serif text-4xl text-[#526553]"
          >
            Knit &amp; Thread
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center py-4">
        <Link className="mb-8 text-sm text-[#77746b] hover:text-[#526553]" to="/shop">
          ← Back to the collection
        </Link>
        <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
          {product.category}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-[#292b25] sm:text-5xl">
          {product.name}
        </h1>
        <p className="mt-5 text-xl text-[#34362f]">{formatCurrency(product.price)}</p>
        <p className="mt-6 leading-7 text-[#66645b]">{product.description}</p>

        {product.sizes?.length > 0 && (
          <label className="mt-8 max-w-sm text-sm font-medium text-[#34362f]">
            Size
            <select
              className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 outline-none focus:border-[#526553]"
              onChange={(event) => setSelectedSize(event.target.value)}
              value={size}
            >
              {product.sizes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        {product.colors?.length > 0 && (
          <label className="mt-5 max-w-sm text-sm font-medium text-[#34362f]">
            Color
            <select
              className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 outline-none focus:border-[#526553]"
              onChange={(event) => setSelectedColor(event.target.value)}
              value={color}
            >
              {product.colors.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-7 flex items-center gap-5">
          <span className="text-sm font-medium text-[#34362f]">Quantity</span>
          <div className="flex min-h-11 items-center border border-[#d9d6cd]">
            <button
              aria-label="Decrease quantity"
              className="px-3 py-3 text-[#526553] disabled:text-[#aaa79e]"
              disabled={quantity <= 1}
              onClick={() => updateQuantity(-1)}
              type="button"
            >
              <FiMinus aria-hidden="true" size={14} />
            </button>
            <span aria-live="polite" className="min-w-8 text-center text-sm">
              {quantity}
            </span>
            <button
              aria-label="Increase quantity"
              className="px-3 py-3 text-[#526553] disabled:text-[#aaa79e]"
              disabled={quantity >= product.stock}
              onClick={() => updateQuantity(1)}
              type="button"
            >
              <FiPlus aria-hidden="true" size={14} />
            </button>
          </div>
          <span className="text-xs text-[#77746b]">
              {remainingStock > 0 ? `${remainingStock} available` : 'All available pieces are in your bag'}
          </span>
        </div>

        <button
          className="mt-8 min-h-12 max-w-sm bg-[#526553] px-7 text-sm font-medium text-white hover:bg-[#3f5040] disabled:cursor-not-allowed disabled:bg-[#aaa79e]"
            disabled={remainingStock < 1}
          onClick={handleAddToBag}
          type="button"
        >
            {product.stock < 1
              ? 'Sold out'
              : remainingStock < 1
                ? 'Maximum quantity in bag'
                : 'Add to bag'}
        </button>
        {added && (
          <p aria-live="polite" className="mt-4 text-sm text-[#526553]">
            Added to your bag.{' '}
            <Link className="underline underline-offset-4" to="/cart">
              View bag
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}

function ProductDetail() {
  const { productId } = useParams()
  return <ProductDetailContent key={productId} productId={productId} />
}

export default ProductDetail
