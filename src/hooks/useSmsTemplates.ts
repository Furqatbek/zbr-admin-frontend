import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { smsTemplatesApi } from '@/api/sms-templates.api'
import type { SmsTemplateRequest } from '@/types'

export const smsTemplateKeys = {
  all: ['sms-templates'] as const,
  list: () => [...smsTemplateKeys.all, 'list'] as const,
  stats: () => [...smsTemplateKeys.all, 'stats'] as const,
}

export function useSmsTemplates() {
  return useQuery({
    queryKey: smsTemplateKeys.list(),
    queryFn: () => smsTemplatesApi.list(),
  })
}

export function useSmsTemplateStats() {
  return useQuery({
    queryKey: smsTemplateKeys.stats(),
    queryFn: () => smsTemplatesApi.getStats(),
  })
}

export function useCreateSmsTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SmsTemplateRequest) => smsTemplatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsTemplateKeys.all })
    },
  })
}

export function useUpdateSmsTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SmsTemplateRequest }) =>
      smsTemplatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsTemplateKeys.all })
    },
  })
}

export function useSyncSmsTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => smsTemplatesApi.sync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsTemplateKeys.all })
    },
  })
}

export function useSyncAllSmsTemplates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => smsTemplatesApi.syncAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsTemplateKeys.all })
    },
  })
}

export function useDeactivateSmsTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => smsTemplatesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsTemplateKeys.all })
    },
  })
}
