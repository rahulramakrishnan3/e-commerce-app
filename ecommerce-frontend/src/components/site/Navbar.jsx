import { useState } from 'react'
import { FiMenu, FiShoppingBag, FiX } from 'react-icons/fi'
import { Link, NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Shop', to: '/shop' },
  { label: 'Our story', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors hover:text-[#526553] ${
      isActive ? 'text-[#526553]' : 'text-[#625f57]'
    }`

  return (
    <>
      <div className="bg-[#526553] px-4 py-2 text-center text-xs tracking-[0.12em] text-white">
        THOUGHTFUL LAYERS FOR EVERYDAY LIVING
      </div>
      <header className="relative z-10 border-b border-[#e9e6de] bg-[#faf9f6]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            className="font-serif text-xl font-semibold tracking-[0.03em] text-[#292b25] sm:text-2xl"
            to="/"
            onClick={() => setMenuOpen(false)}
          >
            Knit and Thread
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-9 md:flex">
            {navigation.map((item) => (
              <NavLink key={item.label} className={linkClass} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <NavLink className={linkClass} to="/login">
              Sign in
            </NavLink>
            <NavLink
              aria-label="Shopping bag"
              className="text-[#34362f] transition-colors hover:text-[#526553]"
              to="/cart"
            >
              <FiShoppingBag aria-hidden="true" size={20} />
            </NavLink>
          </div>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="rounded p-2 text-[#34362f] hover:bg-[#efeee8] md:hidden"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            type="button"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-1 border-t border-[#e9e6de] px-5 py-3 md:hidden"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.label}
                className={({ isActive }) =>
                  `rounded px-3 py-3 text-sm ${
                    isActive ? 'bg-[#edeee8] text-[#526553]' : 'text-[#625f57]'
                  }`
                }
                onClick={() => setMenuOpen(false)}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              className="rounded px-3 py-3 text-sm text-[#625f57]"
              onClick={() => setMenuOpen(false)}
              to="/login"
            >
              Sign in
            </NavLink>
            <NavLink
              className="rounded px-3 py-3 text-sm text-[#625f57]"
              onClick={() => setMenuOpen(false)}
              to="/cart"
            >
              Shopping bag
            </NavLink>
          </nav>
        )}
      </header>
    </>
  )
}

export default Navbar
