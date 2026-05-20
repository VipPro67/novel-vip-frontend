"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

// --- Bookmarks ---
export function useCreateBookmarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { chapterId: string; novelId: string; note?: string; progress?: number }) =>
      unwrapApiResponse(await api.createBookmark(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
    },
  })
}

export function useUpdateBookmarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { note?: string; progress?: number } }) =>
      unwrapApiResponse(await api.updateBookmark(id, data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
    },
  })
}

export function useDeleteBookmarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => unwrapApiResponse(await api.deleteBookmark(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
    },
  })
}

// --- Comments ---
export function useAddCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { content: string; novelId?: string; chapterId?: string; parentId?: string }) =>
      unwrapApiResponse(await api.addComment(data)),
    onSuccess: async (_, variables) => {
      if (variables.novelId) {
        await queryClient.invalidateQueries({ queryKey: ["novels", "comments", { novelId: variables.novelId }] })
      }
      if (variables.chapterId) {
        await queryClient.invalidateQueries({ queryKey: ["chapters", "comments", { chapterId: variables.chapterId }] })
      }
    },
  })
}

export function useUpdateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: { content: string } }) =>
      unwrapApiResponse(await api.updateComment(commentId, data)),
    onSuccess: async () => {
      // Invalidate all comments categories to stay updated
      await queryClient.invalidateQueries({ queryKey: ["novels", "comments"] })
      await queryClient.invalidateQueries({ queryKey: ["chapters", "comments"] })
    },
  })
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => unwrapApiResponse(await api.deleteComment(commentId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["novels", "comments"] })
      await queryClient.invalidateQueries({ queryKey: ["chapters", "comments"] })
    },
  })
}

// --- Ratings ---
export function useRateNovelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ novelId, score, review }: { novelId: string; score: number; review?: string }) =>
      unwrapApiResponse(await api.rateNovel(novelId, score, review)),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["novels", "user-rating", { novelId: variables.novelId }] })
      await queryClient.invalidateQueries({ queryKey: ["novels", "detail", { id: variables.novelId }] })
    },
  })
}

// --- Reports ---
export function useCreateReportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      reportType: "NOVEL" | "CHAPTER" | "COMMENT" | "REVIEW" | "USER"
      targetId: string
      reason: "SPAM" | "INAPPROPRIATE_CONTENT" | "COPYRIGHT_VIOLATION" | "HARASSMENT" | "MISINFORMATION" | "OTHER"
      description: string
    }) => unwrapApiResponse(await api.createReport(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports", "mine"] })
    },
  })
}

// --- Feature Requests ---
export function useCreateFeatureRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; description: string; category: string }) =>
      unwrapApiResponse(await api.createFeatureRequest(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feature-requests"] })
    },
  })
}

export function useVoteFeatureRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (featureRequestId: string) => unwrapApiResponse(await api.voteFeatureRequest(featureRequestId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feature-requests"] })
    },
  })
}

export function useUnvoteFeatureRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (featureRequestId: string) => unwrapApiResponse(await api.unvoteFeatureRequest(featureRequestId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feature-requests"] })
    },
  })
}

// --- Reviews ---
export function useCreateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { novelId: string; title: string; content: string; rating: number }) =>
      unwrapApiResponse(await api.createReview(data)),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["reviews", "novel", { novelId: variables.novelId }] })
    },
  })
}

export function useUpdateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: string; data: { title: string; content: string; rating: number } }) =>
      unwrapApiResponse(await api.updateReview(reviewId, data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
  })
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: string) => unwrapApiResponse(await api.deleteReview(reviewId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
  })
}

// --- Role Requests ---
export function useRequestRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestedRole, reason }: { requestedRole: string; reason: string }) =>
      unwrapApiResponse(await api.requestRole(requestedRole, reason)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["role-requests", "mine"] })
    },
  })
}

// --- Favorites ---
export function useAddToFavoritesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (novelId: string) => unwrapApiResponse(await api.addToFavorites(novelId)),
    onSuccess: async (_, novelId) => {
      await queryClient.invalidateQueries({ queryKey: ["novels", "favorite-status", { novelId }] })
      await queryClient.invalidateQueries({ queryKey: ["novels", "favorites"] })
    },
  })
}

export function useRemoveFromFavoritesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (novelId: string) => unwrapApiResponse(await api.removeFromFavorites(novelId)),
    onSuccess: async (_, novelId) => {
      await queryClient.invalidateQueries({ queryKey: ["novels", "favorite-status", { novelId }] })
      await queryClient.invalidateQueries({ queryKey: ["novels", "favorites"] })
    },
  })
}

