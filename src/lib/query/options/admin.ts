import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export type AdminListParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  search?: string
}

export const adminQueryOptions = {
  dashboard: () =>
    queryOptions({
      queryKey: queryKeys.admin.dashboard(),
      queryFn: async () => unwrapApiResponse(await api.getDashboardStats()),
    }),
  users: (params: AdminListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.admin.users(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getAllUsers(params)),
    }),
  novels: (params: AdminListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.admin.novels(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getNovels(params)),
    }),
  comments: (params: AdminListParams & { status?: string } = {}) =>
    queryOptions({
      queryKey: queryKeys.admin.comments(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getAllComments(params)),
    }),
  reports: (params: AdminListParams & { status?: string; reportType?: string } = {}) =>
    queryOptions({
      queryKey: queryKeys.admin.reports(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getAllReports(params)),
    }),
  reviews: (params: AdminListParams & { status?: string } = {}) =>
    queryOptions({
      queryKey: queryKeys.admin.reviews(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getAllReviews(params)),
    }),
  correctionsPending: (params: { page?: number; size?: number; direction?: "ASC" | "DESC" } = {}) =>
    queryOptions({
      queryKey: queryKeys.admin.correctionsPending(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getPendingCorrections(params)),
    }),
  correctionsByStatus: (status: string, params: { page?: number; size?: number } = {}) =>
    queryOptions({
      queryKey: queryKeys.admin.correctionsByStatus(status, params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getCorrectionsByStatus(status, params)),
    }),
  correctionDetail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.admin.correctionDetail(id),
      queryFn: async () => unwrapApiResponse(await api.getCorrectionById(id)),
    }),
  novelSourcesAll: () =>
    queryOptions({
      queryKey: queryKeys.admin.novelSourcesAll(),
      queryFn: async () => unwrapApiResponse(await api.getAllNovelSources()),
    }),
  novelSourcesByNovelId: (novelId: string) =>
    queryOptions({
      queryKey: queryKeys.admin.novelSourcesByNovelId(novelId),
      enabled: Boolean(novelId),
      queryFn: async () => unwrapApiResponse(await api.getNovelSourcesByNovelId(novelId)),
    }),
  novelSourceDetail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.admin.novelSourceDetail(id),
      queryFn: async () => unwrapApiResponse(await api.getNovelSource(id)),
    }),
}
