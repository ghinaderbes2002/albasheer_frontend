import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMe,
  requestCode,
  updateMe,
  verifyCode,
  type RequestCodePayload,
  type VerifyCodePayload,
} from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import type { ProfilePatch } from '@/types/api'

export const meQueryKey = ['auth', 'me'] as const

export function useMe(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    enabled: enabled && !!accessToken,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRequestCode() {
  return useMutation({
    mutationFn: (payload: RequestCodePayload) => requestCode(payload),
  })
}

export function useVerifyCode() {
  const setTokens = useAuthStore((s) => s.setTokens)
  return useMutation({
    mutationFn: (payload: VerifyCodePayload) => verifyCode(payload),
    onSuccess: (data) => {
      setTokens({ access: data.access, refresh: data.refresh })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (patch: ProfilePatch) => updateMe(patch),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(meQueryKey, user)
    },
  })
}
