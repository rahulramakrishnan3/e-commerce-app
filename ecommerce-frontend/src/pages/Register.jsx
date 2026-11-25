import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { clearAuthError } from '../redux/slices/authSlice.js'
import { registerUser } from '../redux/thunks/authThunks.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

function Register() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
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
    const password = formData.get('password')
    if (password !== formData.get('confirmPassword')) {
      setFormError('The passwords do not match.')
      return
    }

    const result = await dispatch(
      registerUser({
        name: formData.get('name'),
        email: formData.get('email'),
        password,
      }),
    )
    if (registerUser.fulfilled.match(result)) {
      const destination = location.state?.from?.pathname || '/orders'
      navigate(destination, { replace: true })
    }
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="mb-9 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
          Join the community
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#292b25] sm:text-5xl">
          Create an account
        </h1>
        <p className="mt-4 text-sm text-[#66645b]">
          A little space to keep your orders and favourites together.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-xs font-medium text-[#625f57]">
          Name
          <input
            autoComplete="name"
            className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            maxLength={100}
            name="name"
            required
          />
        </label>
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
            autoComplete="new-password"
            className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            minLength={8}
            name="password"
            required
            type="password"
          />
          <span className="mt-1 block font-normal text-[#858176]">
            Use at least 8 characters.
          </span>
        </label>
        <label className="block text-xs font-medium text-[#625f57]">
          Confirm password
          <input
            autoComplete="new-password"
            className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </label>
        {(formError || error) && (
          <p className="bg-[#f7ebe7] p-4 text-sm text-[#8b3c2d]" role="alert">
            {formError || getErrorMessage(error, 'Account creation could not be completed.')}
          </p>
        )}
        <button
          className="min-h-12 w-full bg-[#526553] px-7 text-sm font-medium text-white hover:bg-[#3f5040] disabled:cursor-wait disabled:opacity-70"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-[#625f57]">
        Already have an account?{' '}
        <Link
          className="text-[#526553] underline underline-offset-4"
          state={location.state}
          to="/login"
        >
          Sign in
        </Link>
      </p>
    </section>
  )
}

export default Register
