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

export function useApproveCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => unwrapApiResponse(await api.approveComment(commentId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "comments"] })
    },
  })
}

export function useRejectCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => unwrapApiResponse(await api.rejectComment(commentId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "comments"] })
    },
  })
}

export function useCreateSystemNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; content: string; type: "INFO" | "WARNING" | "ALERT" }) =>
      unwrapApiResponse(await api.createSystemNotification(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] })
      await queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useUpdateNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; content?: string; type?: "INFO" | "WARNING" | "ALERT"; status?: "ACTIVE" | "INACTIVE" } }) =>
      unwrapApiResponse(await api.updateNotification(id, data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] })
      await queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => unwrapApiResponse(await api.deleteNotification(notificationId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] })
      await queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useUpdateReportStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      unwrapApiResponse(await api.updateReportStatus(id, status)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "reports"] })
      await queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
  })
}

export function useResolveReportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) =>
      unwrapApiResponse(await api.resolveReport(id, action)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "reports"] })
      await queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
  })
}

export function useFlagReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
      unwrapApiResponse(await api.flagReview(id, reason)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] })
    },
  })
}

export function useApproveCorrectionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => unwrapApiResponse(await api.approveCorrection(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "corrections"] })
    },
  })
}

export function useRejectCorrectionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
      unwrapApiResponse(await api.rejectCorrection(id, reason)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "corrections"] })
    },
  })
}

export function useCreateNovelSourceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => unwrapApiResponse(await api.createNovelSource(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "novel-sources"] })
    },
  })
}

export function useUpdateNovelSourceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      unwrapApiResponse(await api.updateNovelSource(id, data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "novel-sources"] })
    },
  })
}

export function useDeleteNovelSourceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => unwrapApiResponse(await api.deleteNovelSource(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "novel-sources"] })
    },
  })
}

export function useTriggerSyncMutation() {
  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request?: any }) =>
      unwrapApiResponse(await api.triggerSync(id, request)),
  })
}

export function useQuickImportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => unwrapApiResponse(await api.quickImport(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "novel-sources"] })
    },
  })
}

