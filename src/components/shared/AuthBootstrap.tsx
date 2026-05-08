import { useEffect } from 'react'
import { useMe } from '@/features/auth/queries'
import { useAuthStore } from '@/store/auth'

/**
 * Mounts once at the app root. While there is an access token, fetches /me
 * and mirrors the result into the Zustand auth store so role-based guards
 * have an up-to-date user.
 *
 * Renders nothing.
 */
export function AuthBootstrap() {
  const { data } = useMe()
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])

  return null
}
