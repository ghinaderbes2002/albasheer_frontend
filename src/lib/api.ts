import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/store/auth'

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8000'

export const MEDIA_BASE =
  (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ?? API_BASE

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to outgoing requests.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Single-flight refresh: many parallel 401s share one /token/refresh call.
let refreshPromise: Promise<string | null> | null = null

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined
    const status = err.response?.status

    const isAuthEndpoint =
      original?.url?.includes('/api/auth/token/refresh/') ||
      original?.url?.includes('/api/auth/verify-code/') ||
      original?.url?.includes('/api/auth/request-code/')

    if (status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true
      const refresh = useAuthStore.getState().refreshToken
      if (!refresh) {
        useAuthStore.getState().logout()
        return Promise.reject(err)
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post<{ access: string }>(
              `${API_BASE}/api/auth/token/refresh/`,
              { refresh },
            )
            .then((r) => r.data.access)
            .catch(() => null)
            .finally(() => {
              refreshPromise = null
            })
        }
        const newAccess = await refreshPromise
        if (!newAccess) {
          useAuthStore.getState().logout()
          return Promise.reject(err)
        }
        useAuthStore.getState().setAccessToken(newAccess)
        if (original.headers) {
          original.headers.Authorization = `Bearer ${newAccess}`
        }
        return api.request(original)
      } catch (refreshErr) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(err)
  },
)

/**
 * Convert a relative `/media/...` path coming from the backend to an absolute
 * URL. Already-absolute URLs are returned unchanged.
 */
export function resolveMediaUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${MEDIA_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

/**
 * Pull a human-readable message out of an Axios error.
 */
export function extractApiError(err: unknown, fallback = 'حدث خطأ'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { detail?: string; non_field_errors?: string[] }
      | undefined
    if (data?.detail) return data.detail
    if (data?.non_field_errors?.length) return data.non_field_errors[0]
    if (err.message) return err.message
  }
  return fallback
}
