import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export type RoleRequestListParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export const roleRequestsQueryOptions = {
  mine: (params: RoleRequestListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.roleRequests.mine(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getMyRoleRequests(params)),
    }),
  pending: (params: RoleRequestListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.roleRequests.pending(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getPendingRoleRequests(params)),
    }),
}
