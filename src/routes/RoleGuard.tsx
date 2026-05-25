import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, defaultHomeForRole } from '@/store/auth'
import type { Role } from '@/types/api'

interface RoleGuardProps {
  allow: Role[]
}

export function RoleGuard({ allow }: RoleGuardProps) {
  const role = useAuthStore((s) => s.role)
  if (!role || !allow.includes(role)) {
    return <Navigate to={defaultHomeForRole(role)} replace />
  }
  return <Outlet />
}
