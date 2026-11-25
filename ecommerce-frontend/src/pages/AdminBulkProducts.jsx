import { useRef, useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { createProducts } from '../redux/thunks/productThunks.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

const maximumProducts = 100

const createEmptyProduct = (id) => ({
  id,
  name: '',
  description: '',
  category: '',
  price: '',
  stock: '0',
  sizes: '',
  colors: '',
  images: '',
  isFeatured: false,
})

const parseList = (value) =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)

function ProductFields({ product, index, onChange, onRemove, canRemove }) {
  const fieldClass =
    'mt-2 min-h-11 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]'
  const labelClass = 'block text-xs font-medium text-[#625f57]'

  return (
    <fieldset
      aria-labelledby={`product-heading-${product.id}`}
      className="border border-[#e2dfd6] bg-white p-5 sm:p-7"
    >
      <legend className="sr-only">Product {index + 1}</legend>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2
          className="font-serif text-xl text-[#292b25]"
          id={`product-heading-${product.id}`}
        >
          Product {index + 1}
        </h2>
        <button
          aria-label={`Remove product ${index + 1}`}
          className="inline-flex items-center gap-2 px-2 py-2 text-xs text-[#8b3c2d] hover:bg-[#f7ebe7] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canRemove}
          onClick={onRemove}
          type="button"
        >
          <FiTrash2 aria-hidden="true" size={14} />
          Remove
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>
          Product name
          <input
            className={fieldClass}
            maxLength={150}
            onChange={(event) => onChange('name', event.target.value)}
            required
            value={product.name}
          />
        </label>
        <label className={labelClass}>
          Category
          <input
            className={fieldClass}
            onChange={(event) => onChange('category', event.target.value)}
            required
            value={product.category}
          />
        </label>
        <label className={labelClass}>
          Price (INR)
          <input
            className={fieldClass}
            min="0"
            onChange={(event) => onChange('price', event.target.value)}
            required
            step="0.01"
            type="number"
            value={product.price}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Description
          <textarea
            className="mt-2 w-full border border-[#d9d6cd] bg-white px-3 py-3 text-sm outline-none focus:border-[#526553]"
            maxLength={2000}
            onChange={(event) => onChange('description', event.target.value)}
            required
            rows={3}
            value={product.description}
          />
        </label>
        <label className={labelClass}>
          Stock quantity
          <input
            className={fieldClass}
            min="0"
            onChange={(event) => onChange('stock', event.target.value)}
            required
            step="1"
            type="number"
            value={product.stock}
          />
        </label>
        <label className={`${labelClass} flex items-center gap-3 self-end pb-3`}>
          <input
            checked={product.isFeatured}
            className="h-4 w-4 accent-[#526553]"
            onChange={(event) => onChange('isFeatured', event.target.checked)}
            type="checkbox"
          />
          Feature on the storefront
        </label>
        <label className={labelClass}>
          Sizes
          <textarea
            className="mt-2 w-full border border-[#d9d6cd] bg-white px-3 py-3 text-sm outline-none focus:border-[#526553]"
            onChange={(event) => onChange('sizes', event.target.value)}
            placeholder="S, M, L"
            rows={2}
            value={product.sizes}
          />
        </label>
        <label className={labelClass}>
          Colors
          <textarea
            className="mt-2 w-full border border-[#d9d6cd] bg-white px-3 py-3 text-sm outline-none focus:border-[#526553]"
            onChange={(event) => onChange('colors', event.target.value)}
            placeholder="Oatmeal, Navy"
            rows={2}
            value={product.colors}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Image URLs
          <textarea
            className="mt-2 w-full border border-[#d9d6cd] bg-white px-3 py-3 text-sm outline-none focus:border-[#526553]"
            onChange={(event) => onChange('images', event.target.value)}
            placeholder="https://example.com/product-front.jpg"
            rows={2}
            value={product.images}
          />
          <span className="mt-1 block font-normal text-[#858176]">
            Separate multiple sizes, colors, or image URLs with commas or new
            lines.
          </span>
        </label>
      </div>
    </fieldset>
  )
}

function AdminBulkProducts() {
  const dispatch = useDispatch()
  const { mutationStatus, error } = useSelector((state) => state.products)
  const [products, setProducts] = useState(() => [createEmptyProduct(1)])
  const [successMessage, setSuccessMessage] = useState('')
  const nextId = useRef(2)
  const isSubmitting = mutationStatus === 'loading'
  const validationErrors = Array.isArray(error?.errors) ? error.errors : []

  const updateProduct = (id, field, value) => {
    setSuccessMessage('')
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, [field]: value } : product,
      ),
    )
  }

  const addProduct = () => {
    setSuccessMessage('')
    setProducts((current) => [
      ...current,
      createEmptyProduct(nextId.current++),
    ])
  }

  const removeProduct = (id) => {
    setProducts((current) => current.filter((product) => product.id !== id))
  }

  const submitProducts = async (event) => {
    event.preventDefault()
    setSuccessMessage('')
    const payload = products.map(({ id: _clientId, ...product }) => ({
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
      sizes: parseList(product.sizes),
      colors: parseList(product.colors),
      images: parseList(product.images),
    }))
    const result = await dispatch(createProducts(payload))

    if (createProducts.fulfilled.match(result)) {
      const count = result.payload.count ?? result.payload.products.length
      setSuccessMessage(`${count} product${count === 1 ? '' : 's'} added.`)
      setProducts([createEmptyProduct(nextId.current++)])
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        className="text-sm text-[#526553] underline-offset-4 hover:underline"
        to="/shop"
      >
        ← View storefront
      </Link>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
            Admin tools
          </p>
          <h1 className="mt-3 font-serif text-4xl text-[#292b25] sm:text-5xl">
            Add products
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[#66645b]">
            Add up to {maximumProducts} catalog items in one submission. If
            any item is invalid, the batch is rejected so you can correct it
            before trying again.
          </p>
        </div>
        <p className="text-sm text-[#77746b]">
          {products.length} / {maximumProducts} products
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={submitProducts}>
        {products.map((product, index) => (
          <ProductFields
            canRemove={products.length > 1 && !isSubmitting}
            index={index}
            key={product.id}
            onChange={(field, value) =>
              updateProduct(product.id, field, value)
            }
            onRemove={() => removeProduct(product.id)}
            product={product}
          />
        ))}

        {error && (
          <div className="bg-[#f7ebe7] p-5 text-sm text-[#8b3c2d]" role="alert">
            <p>{getErrorMessage(error, 'The products could not be added.')}</p>
            {validationErrors.length > 0 && (
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {validationErrors.map((item) => (
                  <li key={`${item.index}-${item.message}`}>
                    Product {item.index + 1}: {item.message}
                    {item.fields &&
                      Object.entries(item.fields).map(([field, message]) => (
                        <span className="block" key={field}>
                          {field}: {message}
                        </span>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {successMessage && (
          <p className="bg-[#edf1ea] p-4 text-sm text-[#405444]" role="status">
            {successMessage}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-[#e9e6de] pt-5 sm:flex-row sm:justify-between">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#526553] px-5 text-sm text-[#526553] hover:bg-[#edf1ea] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={products.length >= maximumProducts || isSubmitting}
            onClick={addProduct}
            type="button"
          >
            <FiPlus aria-hidden="true" size={16} />
            Add another product
          </button>
          <button
            className="min-h-11 bg-[#526553] px-7 text-sm font-medium text-white hover:bg-[#3f5040] disabled:cursor-wait disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? 'Adding products...'
              : `Add ${products.length} product${products.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </form>
    </section>
  )
}

export default AdminBulkProducts
