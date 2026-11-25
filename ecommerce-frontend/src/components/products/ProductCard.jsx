import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency.js'

function ProductCard({ product }) {
  const image = product.images?.[0]

  return (
    <article className="group">
      <Link
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/5] overflow-hidden bg-[#e8e8df]"
        to={`/products/${product._id}`}
      >
        {image ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            src={image}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full items-center justify-center bg-gradient-to-br from-[#e7e5d9] via-[#dce1d7] to-[#c9d2c4] px-8 text-center font-serif text-3xl text-[#526553]"
          >
            Knit &amp; Thread
          </div>
        )}
        {product.stock === 0 && (
          <span className="absolute left-3 top-3 bg-white/90 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#615e55]">
            Sold out
          </span>
        )}
      </Link>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#858176]">
            {product.category}
          </p>
          <Link
            className="mt-1 inline-block font-serif text-lg text-[#292b25] hover:text-[#526553]"
            to={`/products/${product._id}`}
          >
            {product.name}
          </Link>
        </div>
        <p className="pt-5 text-sm font-medium text-[#34362f]">
          {formatCurrency(product.price)}
        </p>
      </div>
    </article>
  )
}

export default ProductCard
