import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="border-t border-[#e9e6de] bg-[#f2f1eb]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link className="font-serif text-lg font-semibold text-[#292b25]" to="/">
            Knit and Thread
          </Link>
          <p className="mt-1 text-sm text-[#77746b]">
            Thoughtful knitwear, made for everyday living.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex gap-6 text-sm text-[#625f57]">
          <Link className="hover:text-[#526553]" to="/shop">
            Shop
          </Link>
          <Link className="hover:text-[#526553]" to="/contact">
            Contact
          </Link>
          <Link className="hover:text-[#526553]" to="/orders">
            Orders
          </Link>
        </nav>
        <p className="text-xs text-[#8a877e]">
          © {currentYear} Knit and Thread
        </p>
      </div>
    </footer>
  )
}

export default Footer
