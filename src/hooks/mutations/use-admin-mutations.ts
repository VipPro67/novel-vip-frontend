"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export function useDeleteNovelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (novelId: string) => unwrapApiResponse(await api.deleteNovel(novelId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "novels"] })
    },
  })
}

export function useUpdateUserRolesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) =>
      unwrapApiResponse(await api.updateUserRoles(userId, roles)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}
