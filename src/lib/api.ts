import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/store/auth'

export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8000'

export const MEDIA_BASE =
  (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ?? API_BASE

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
})

// Attach JWT and set Content-Type for outgoing requests.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Only set JSON content type when the body is NOT FormData.
  // FormData payloads need the browser to set Content-Type automatically
  // so it includes the correct multipart boundary.
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
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
      original?.url?.includes('/api/auth/staff/refresh/') ||
      original?.url?.includes('/api/auth/verify-code/') ||
      original?.url?.includes('/api/auth/request-code/') ||
      original?.url?.includes('/api/auth/staff/login/')

    if (status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true
      const refresh = useAuthStore.getState().refreshToken
      if (!refresh) {
        useAuthStore.getState().logout()
        return Promise.reject(err)
      }

      try {
        if (!refreshPromise) {
          const role = useAuthStore.getState().role
          const isStaff = role === 'branch_manager' || role === 'delivery' || role === 'admin'
          const refreshUrl = isStaff
            ? `${API_BASE}/api/auth/staff/refresh/`
            : `${API_BASE}/api/auth/token/refresh/`
          refreshPromise = axios
            .post<{ access: string }>(refreshUrl, { refresh })
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
 * Handles: detail, non_field_errors, field-level errors, raw strings.
 */
export function extractApiError(err: unknown, fallback = 'حدث خطأ'): string {
  if (!axios.isAxiosError(err)) return fallback

  const data = err.response?.data

  if (!data) return err.message || fallback

  if (typeof data === 'string') {
    // Ignore HTML Django debug pages
    if (data.trimStart().startsWith('<'))
      return `${err.response?.status ?? 'Server'} Error`
    return data
  }

  if (typeof data === 'object') {
    if (typeof data.detail === 'string') return data.detail

    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length)
      return String(data.non_field_errors[0])

    // First field-level error: { phone: ["Already exists."] }
    for (const key of Object.keys(data)) {
      const val = (data as Record<string, unknown>)[key]
      if (Array.isArray(val) && val.length && typeof val[0] === 'string')
        return `${key}: ${val[0]}`
      if (typeof val === 'string') return `${key}: ${val}`
    }
  }

  return err.message || fallback
}
