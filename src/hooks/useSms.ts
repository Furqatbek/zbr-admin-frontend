import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { smsApi } from '@/api/sms.api'
import type { SmsConfigUpdate, SmsProvider, SmsProviderCredentials } from '@/types'

export const smsKeys = {
  all: ['sms'] as const,
  status: () => [...smsKeys.all, 'status'] as const,
  provider: (provider: SmsProvider) => [...smsKeys.all, 'provider', provider] as const,
}

export function useSmsStatus() {
  return useQuery({
    queryKey: smsKeys.status(),
    queryFn: () => smsApi.getStatus(),
  })
}

export function useProviderDetails(provider: SmsProvider) {
  return useQuery({
    queryKey: smsKeys.provider(provider),
    queryFn: () => smsApi.getProviderDetails(provider),
  })
}

export function useUpdateSmsConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: SmsConfigUpdate) => smsApi.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.all })
    },
  })
}

export function useSwitchSmsProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (provider: SmsProvider) => smsApi.switchProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.all })
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

export function useUpdateProviderCredentials() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: SmsProviderCredentials) =>
      smsApi.updateProviderCredentials(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.all })
    },
  })
}

export function useEnableProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (provider: SmsProvider) => smsApi.enableProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.all })
    },
  })
}

export function useDisableProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (provider: SmsProvider) => smsApi.disableProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.all })
    },
  })
}
