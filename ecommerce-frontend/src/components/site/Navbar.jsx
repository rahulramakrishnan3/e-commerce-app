import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiMenu, FiShoppingBag, FiX } from 'react-icons/fi'
import { Link, NavLink } from 'react-router-dom'
import {
  logoutUser,
  selectCurrentUser,
  selectIsAuthenticated,
} from '../../redux/slices/authSlice.js'
import { selectCartItemCount } from '../../redux/slices/cartSlice.js'

const navigation = [
  { label: 'Shop', to: '/shop' },
  { label: 'Our story', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const cartItemCount = useSelector(selectCartItemCount)

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors hover:text-[#526553] ${
      isActive ? 'text-[#526553]' : 'text-[#625f57]'
    }`

  const signOut = () => {
    dispatch(logoutUser())
    setMenuOpen(false)
  }

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
            {isAuthenticated ? (
              <>
                {user.role === 'admin' && (
                  <NavLink className={linkClass} to="/admin/products/bulk">
                    Add products
                  </NavLink>
                )}
                <NavLink className={linkClass} to="/orders">
                  {user.name}
                </NavLink>
                <button
                  className="text-sm text-[#625f57] transition-colors hover:text-[#526553]"
                  onClick={signOut}
                  type="button"
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink className={linkClass} to="/login">
                Sign in
              </NavLink>
            )}
            <NavLink
              aria-label="Shopping bag"
              className="relative text-[#34362f] transition-colors hover:text-[#526553]"
              to="/cart"
            >
              <FiShoppingBag aria-hidden="true" size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#526553] px-1 text-[10px] text-white">
                  {cartItemCount}
                </span>
              )}
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
            {isAuthenticated ? (
              <>
                {user.role === 'admin' && (
                  <NavLink
                    className="rounded px-3 py-3 text-sm text-[#625f57]"
                    onClick={() => setMenuOpen(false)}
                    to="/admin/products/bulk"
                  >
                    Add products
                  </NavLink>
                )}
                <NavLink
                  className="rounded px-3 py-3 text-sm text-[#625f57]"
                  onClick={() => setMenuOpen(false)}
                  to="/orders"
                >
                  {user.name}
                </NavLink>
                <button
                  className="rounded px-3 py-3 text-left text-sm text-[#625f57]"
                  onClick={signOut}
                  type="button"
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink
                className="rounded px-3 py-3 text-sm text-[#625f57]"
                onClick={() => setMenuOpen(false)}
                to="/login"
              >
                Sign in
              </NavLink>
            )}
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
