import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export type ReviewListParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export const reviewsQueryOptions = {
  novel: (novelId: string, params: ReviewListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.reviews.novel(novelId, params),
      placeholderData: keepPreviousData,
      enabled: Boolean(novelId),
      queryFn: async () => unwrapApiResponse(await api.getNovelReviews(novelId, params)),
    }),
}
