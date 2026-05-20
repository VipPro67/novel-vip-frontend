"use client"

import { useQuery } from "@tanstack/react-query"
import { adminQueryOptions, type AdminListParams } from "@/lib/query/options/admin"

export function useAdminDashboardQuery() {
  return useQuery(adminQueryOptions.dashboard())
}

export function useAdminUsersQuery(params: AdminListParams = {}) {
  return useQuery(adminQueryOptions.users(params))
}

export function useAdminNovelsQuery(params: AdminListParams = {}) {
  return useQuery(adminQueryOptions.novels(params))
}

export function useAdminCommentsQuery(params: AdminListParams & { status?: string } = {}) {
  return useQuery(adminQueryOptions.comments(params))
}

export function useAdminReportsQuery(params: AdminListParams & { status?: string; reportType?: string } = {}) {
  return useQuery(adminQueryOptions.reports(params))
}

export function useAdminReviewsQuery(params: AdminListParams & { status?: string } = {}) {
  return useQuery(adminQueryOptions.reviews(params))
}

export function useAdminCorrectionsPendingQuery(params: { page?: number; size?: number; direction?: "ASC" | "DESC" } = {}) {
  return useQuery(adminQueryOptions.correctionsPending(params))
}

export function useAdminCorrectionsByStatusQuery(status: string, params: { page?: number; size?: number } = {}) {
  return useQuery(adminQueryOptions.correctionsByStatus(status, params))
}

export function useAdminCorrectionDetailQuery(id: string) {
  return useQuery(adminQueryOptions.correctionDetail(id))
}

export function useAdminNovelSourcesAllQuery() {
  return useQuery(adminQueryOptions.novelSourcesAll())
}

export function useAdminNovelSourcesByNovelIdQuery(novelId: string) {
  return useQuery(adminQueryOptions.novelSourcesByNovelId(novelId))
}

export function useAdminNovelSourceDetailQuery(id: string) {
  return useQuery(adminQueryOptions.novelSourceDetail(id))
}

