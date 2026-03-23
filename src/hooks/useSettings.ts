import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi, type PlatformSettings, type ExportRequest, type DeliveryFeeSettings } from '@/api/settings.api'

export const settingsKeys = {
  all: ['settings'] as const,
  platform: () => [...settingsKeys.all, 'platform'] as const,
  exports: () => [...settingsKeys.all, 'exports'] as const,
  deliveryFee: () => [...settingsKeys.all, 'delivery-fee'] as const,
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: settingsKeys.platform(),
    queryFn: () => settingsApi.getSettings(),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<PlatformSettings>) => settingsApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.platform() })
    },
  })
}

export function useExportJobs() {
  return useQuery({
    queryKey: settingsKeys.exports(),
    queryFn: () => settingsApi.getExportJobs(),
    refetchInterval: 5000, // Poll every 5 seconds for job status updates
  })
}

export function useExportData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ExportRequest) => settingsApi.exportData(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.exports() })
    },
  })
}

// ============ Delivery Fee Settings ============

export function useDeliveryFeeSettings() {
  return useQuery({
    queryKey: settingsKeys.deliveryFee(),
    queryFn: () => settingsApi.getDeliveryFeeSettings(),
  })
}

export function useUpdateDeliveryFeeSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<DeliveryFeeSettings>) =>
      settingsApi.updateDeliveryFeeSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.deliveryFee() })
    },
  })
}
