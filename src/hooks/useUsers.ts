import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, type UsersQueryParams, type UpdateUserStatusRequest, type AssignRoleRequest } from '@/api/users.api'
import type { UserRole } from '@/types'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UsersQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
}

export function useUsers(params: UsersQueryParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserStatusRequest }) =>
      usersApi.updateUserStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useLockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.lockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUnlockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.unlockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useAssignRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignRoleRequest }) =>
      usersApi.assignRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useRemoveRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      usersApi.removeRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
