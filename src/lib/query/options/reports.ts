import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export type ReportListParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  status?: string
  reportType?: string
}

export type FeatureRequestListParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  status?: string
  category?: string
}

export const reportsQueryOptions = {
  mine: (params: ReportListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.reports.mine(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getMyReports(params)),
    }),
}

export const featureRequestsQueryOptions = {
  list: (params: FeatureRequestListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.featureRequests.list(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getFeatureRequests(params)),
    }),
}
