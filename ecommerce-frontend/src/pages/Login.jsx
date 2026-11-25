import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { clearAuthError } from '../redux/slices/authSlice.js'
import { loginUser } from '../redux/thunks/authThunks.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, isLoading, error } = useSelector((state) => state.auth)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  if (token && user) {
    return <Navigate replace to="/orders" />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const formData = new FormData(event.currentTarget)
    const result = await dispatch(
      loginUser({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    )

    if (loginUser.fulfilled.match(result)) {
      const destination = location.state?.from?.pathname || '/orders'
      navigate(destination, { replace: true })
    }
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="mb-9 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
          Welcome back
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#292b25] sm:text-5xl">
          Sign in
        </h1>
        <p className="mt-4 text-sm text-[#66645b]">
          Sign in to view your orders and complete checkout.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-xs font-medium text-[#625f57]">
          Email
          <input
            autoComplete="email"
            className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="block text-xs font-medium text-[#625f57]">
          Password
          <input
            autoComplete="current-password"
            className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            name="password"
            required
            type="password"
          />
        </label>
        {(formError || error) && (
          <p className="bg-[#f7ebe7] p-4 text-sm text-[#8b3c2d]" role="alert">
            {formError || getErrorMessage(error, 'Sign in could not be completed.')}
          </p>
        )}
        <button
          className="min-h-12 w-full bg-[#526553] px-7 text-sm font-medium text-white hover:bg-[#3f5040] disabled:cursor-wait disabled:opacity-70"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-[#625f57]">
        New to Knit and Thread?{' '}
        <Link
          className="text-[#526553] underline underline-offset-4"
          state={location.state}
          to="/register"
        >
          Create an account
        </Link>
      </p>
    </section>
  )
}

export default Login
