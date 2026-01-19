import api from './axios'
import type { ApiResponse, PaginatedResponse, User, UserRole, UserStatus } from '@/types'

export interface UsersQueryParams {
  page?: number
  size?: number
  role?: UserRole
  status?: UserStatus
  search?: string
}

export interface UpdateUserStatusRequest {
  status: UserStatus
  reason?: string
}

export interface AssignRoleRequest {
  role: UserRole
}

export interface RoleDefinition {
  id: number
  name: string
  displayName: string
  description: string
  usersCount: number
  isSystem: boolean
  permissions: string[]
}

export interface CreateRoleRequest {
  name: string
  displayName: string
  description: string
  permissions: string[]
}

export interface UpdateRoleRequest {
  displayName?: string
  description?: string
  permissions?: string[]
}

export const usersApi = {
  getUsers: async (params: UsersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', { params })
    return response.data
  },

  getUserById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  },

  updateUserStatus: async (id: number, data: UpdateUserStatusRequest): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/status`, data)
    return response.data
  },

  lockUser: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>(`/users/${id}/lock`)
    return response.data
  },

  unlockUser: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>(`/users/${id}/unlock`)
    return response.data
  },

  deleteUser: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`)
    return response.data
  },

  assignRole: async (id: number, data: AssignRoleRequest): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>(`/users/${id}/roles`, data)
    return response.data
  },

  removeRole: async (id: number, role: UserRole): Promise<ApiResponse<User>> => {
    const response = await api.delete<ApiResponse<User>>(`/users/${id}/roles/${role}`)
    return response.data
  },

  // ============ Roles Management ============

  getRoles: async (): Promise<ApiResponse<RoleDefinition[]>> => {
    const response = await api.get<ApiResponse<RoleDefinition[]>>('/roles')
    return response.data
  },

  getRoleById: async (id: number): Promise<ApiResponse<RoleDefinition>> => {
    const response = await api.get<ApiResponse<RoleDefinition>>(`/roles/${id}`)
    return response.data
  },

  createRole: async (data: CreateRoleRequest): Promise<ApiResponse<RoleDefinition>> => {
    const response = await api.post<ApiResponse<RoleDefinition>>('/roles', data)
    return response.data
  },

  updateRole: async (id: number, data: UpdateRoleRequest): Promise<ApiResponse<RoleDefinition>> => {
    const response = await api.put<ApiResponse<RoleDefinition>>(`/roles/${id}`, data)
    return response.data
  },

  deleteRole: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/roles/${id}`)
    return response.data
  },
}
