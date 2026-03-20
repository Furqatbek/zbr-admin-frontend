import api from './axios'
import type { ApiResponse, ImageCategory, ImageUploadResponse, ImageDeleteResponse } from '@/types'

const BASE_URL = '/images'

export const imagesApi = {
  /**
   * Upload an image to the specified category
   * Categories: restaurants, menu-items, profiles, documents
   */
  upload: async (category: ImageCategory, file: File): Promise<ApiResponse<ImageUploadResponse>> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<ApiResponse<ImageUploadResponse>>(
      `${BASE_URL}/upload/${category}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Upload an image for a specific menu item
   */
  uploadMenuItemImage: async (menuItemId: number, file: File): Promise<ApiResponse<ImageUploadResponse>> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<ApiResponse<ImageUploadResponse>>(
      `${BASE_URL}/menu-items/${menuItemId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Get image URL by category and filename
   * Note: Images are publicly accessible, no auth required
   */
  getImageUrl: (category: ImageCategory, filename: string): string => {
    return `/api/v1${BASE_URL}/${category}/${filename}`
  },

  /**
   * Delete an image by category and filename
   */
  delete: async (category: ImageCategory, filename: string): Promise<ApiResponse<ImageDeleteResponse>> => {
    const response = await api.delete<ApiResponse<ImageDeleteResponse>>(
      `${BASE_URL}/${category}/${filename}`
    )
    return response.data
  },
}
