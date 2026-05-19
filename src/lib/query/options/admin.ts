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
}
