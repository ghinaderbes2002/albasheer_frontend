import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, User } from '@/types/api'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  role: Role | null

  setTokens: (tokens: { access: string; refresh: string }) => void
  setAccessToken: (access: string) => void
  setUser: (user: User | null) => void
  setRole: (role: Role | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,

      setTokens: ({ access, refresh }) =>
        set({
          accessToken: access,
          refreshToken: refresh,
        }),
      setAccessToken: (access) => set({ accessToken: access }),
      setUser: (user) =>
        set((state) => ({
          user,
          // Prefer role from /me when present; otherwise keep whatever we had.
          role: user?.role ?? state.role,
        })),
      setRole: (role) => set({ role }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
        }),
    }),
    {
      name: 'albasheer-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        role: state.role,
      }),
    },
  ),
)

export const isAuthenticated = () => !!useAuthStore.getState().accessToken

/**
 * Default landing page for a given role — used after login or when an
 * already-authenticated user lands on `/login`.
 */
export function defaultHomeForRole(role: Role | null): string {
  if (role === 'admin') return '/admin'
  if (role === 'branch_manager') return '/dashboard/branch'
  if (role === 'delivery') return '/dashboard/delivery'
  return '/'
}
