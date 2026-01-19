import { useMutation, useQueryClient } from '@tanstack/react-query'
import { imagesApi } from '@/api/images.api'
import type { ImageCategory } from '@/types'

/**
 * Hook to upload an image to a category
 */
export function useUploadImage(category: ImageCategory) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => imagesApi.upload(category, file),
    onSuccess: () => {
      // Invalidate relevant queries based on category
      if (category === 'restaurants') {
        queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      } else if (category === 'menu-items') {
        queryClient.invalidateQueries({ queryKey: ['menuItems'] })
      } else if (category === 'profiles') {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    },
  })
}

/**
 * Hook to upload a menu item image (via images API)
 * Note: Use useUploadMenuItemImage from useRestaurants for restaurant-specific uploads
 */
export function useUploadMenuItemImageViaImagesApi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ menuItemId, file }: { menuItemId: number; file: File }) =>
      imagesApi.uploadMenuItemImage(menuItemId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
  })
}

/**
 * Hook to delete an image
 */
export function useDeleteImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ category, filename }: { category: ImageCategory; filename: string }) =>
      imagesApi.delete(category, filename),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries based on category
      if (variables.category === 'restaurants') {
        queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      } else if (variables.category === 'menu-items') {
        queryClient.invalidateQueries({ queryKey: ['menuItems'] })
      } else if (variables.category === 'profiles') {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    },
  })
}

/**
 * Utility to get image URL
 */
export function getImageUrl(category: ImageCategory, filename: string): string {
  return imagesApi.getImageUrl(category, filename)
}
