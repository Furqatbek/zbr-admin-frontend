import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { smsApi } from '@/api/sms.api'
import type { SmsConfigUpdate, SmsProvider } from '@/types'

export const smsKeys = {
  all: ['sms'] as const,
  status: () => [...smsKeys.all, 'status'] as const,
}

export function useSmsStatus() {
  return useQuery({
    queryKey: smsKeys.status(),
    queryFn: () => smsApi.getStatus(),
  })
}

export function useUpdateSmsConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: SmsConfigUpdate) => smsApi.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.status() })
    },
  })
}

export function useSwitchSmsProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (provider: SmsProvider) => smsApi.switchProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.status() })
    },
  })
}

export function useToggleSms() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) => smsApi.toggle(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.status() })
    },
  })
}

export function useSendTestSms() {
  return useMutation({
    mutationFn: ({ phoneNumber, message }: { phoneNumber: string; message: string }) =>
      smsApi.sendTest(phoneNumber, message),
  })
}
