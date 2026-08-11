import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, defaultHomeForRole } from '@/store/auth'
import type { Role } from '@/types/api'

interface RoleGuardProps {
  allow: Role[]
}

export function RoleGuard({ allow }: RoleGuardProps) {
  const role = useAuthStore((s) => s.role)
  const accessToken = useAuthStore((s) => s.accessToken)

  // Right after login the token lands before `/me` has reported the role.
  // Bouncing on that gap would dump a just-signed-in customer on the home
  // page instead of the checkout they were headed for, so wait it out —
  // `AuthBootstrap` fills the role in, and a rejected token clears itself
  // and falls through to `ProtectedRoute`.
  if (accessToken && !role) return null

  if (!role || !allow.includes(role)) {
    return <Navigate to={defaultHomeForRole(role)} replace />
  }
  return <Outlet />
}
