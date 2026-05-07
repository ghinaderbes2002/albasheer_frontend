import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import type { Role } from '@/types/api'

interface RoleGuardProps {
  allow: Role[]
}

/**
 * Allow rendering only if the current user's role is in `allow`.
 * Otherwise redirect to /403.
 */
export function RoleGuard({ allow }: RoleGuardProps) {
  const role = useAuthStore((s) => s.role)
  if (!role || !allow.includes(role)) {
    return <Navigate to="/403" replace />
  }
  return <Outlet />
}
