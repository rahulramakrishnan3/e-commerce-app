import { Link } from 'react-router-dom'

function RoutePlaceholder({
  eyebrow,
  title,
  description,
  linkTo = '/shop',
  linkLabel = 'Explore the collection',
}) {
  return (
    <section className="relative isolate flex min-h-[540px] items-center overflow-hidden bg-[#eeeee7] px-5 py-20 sm:px-8 lg:min-h-[620px]">
      <div
        aria-hidden="true"
        className="absolute -right-20 top-1/2 -z-10 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[#d9dfd3] sm:right-[8%] sm:h-[520px] sm:w-[520px]"
      />
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.24em] text-[#526553]">
            {eyebrow}
          </p>
          <h1 className="max-w-xl font-serif text-5xl font-medium leading-[1.08] tracking-[-0.035em] text-[#292b25] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#66645b] sm:text-lg">
            {description}
          </p>
          <Link
            className="mt-9 inline-flex min-h-12 items-center justify-center bg-[#526553] px-7 text-sm font-medium text-white transition-colors hover:bg-[#3f5040] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526553]"
            to={linkTo}
          >
            {linkLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RoutePlaceholder
