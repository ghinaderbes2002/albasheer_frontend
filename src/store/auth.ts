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
        set((state) => ({
          accessToken: access,
          refreshToken: refresh,
          // Default to customer until /me (or backend role claim) tells us
          // otherwise. Staff users are reassigned by AuthBootstrap.
          role: state.role ?? 'customer',
        })),
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
