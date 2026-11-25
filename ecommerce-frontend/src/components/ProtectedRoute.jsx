import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute() {
  const location = useLocation()
  const { token, user, isSessionChecked, isSessionLoading } = useSelector(
    (state) => state.auth,
  )

  if (!isSessionChecked || isSessionLoading) {
    return (
      <div
        aria-live="polite"
        className="flex min-h-[50vh] items-center justify-center text-sm text-[#625f57]"
      >
        Checking your session...
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
