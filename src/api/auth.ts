import { api } from '@/lib/api'
import type {
  AuthResponse,
  ProfilePatch,
  RefreshResponse,
  User,
} from '@/types/api'

export interface RequestCodePayload {
  phone: string
}

export interface VerifyCodePayload {
  phone: string
  code: string
}

export interface StaffLoginPayload {
  phone: string
  password: string
}

export interface StaffAuthResponse {
  access: string
  refresh: string
  user: User
}

export async function requestCode(payload: RequestCodePayload): Promise<void> {
  await api.post('/api/auth/request-code/', payload)
}

export async function verifyCode(
  payload: VerifyCodePayload,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    '/api/auth/verify-code/',
    payload,
  )
  return data
}

export async function refreshAccessToken(
  refresh: string,
): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>(
    '/api/auth/token/refresh/',
    { refresh },
  )
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/api/auth/me/')
  return data
}

export async function updateMe(patch: ProfilePatch): Promise<User> {
  const { data } = await api.patch<User>('/api/auth/me/', patch)
  return data
}

export async function staffLogin(
  payload: StaffLoginPayload,
): Promise<StaffAuthResponse> {
  const { data } = await api.post<StaffAuthResponse>(
    '/api/auth/staff/login/',
    payload,
  )
  return data
}

export interface StaffMe {
  id: number
  phone: string
  full_name: string
  role: string
  branch_id: number | null
  branch_name: string | null
}

export async function getStaffMe(): Promise<StaffMe> {
  const { data } = await api.get<StaffMe>('/api/auth/staff/me/')
  return data
}
