import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

/**
 * Route gate that requires the user to be authenticated.
 * Redirects to /login and preserves the intended destination
 * in `location.state.from` so we can resume after login.
 */
export function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
