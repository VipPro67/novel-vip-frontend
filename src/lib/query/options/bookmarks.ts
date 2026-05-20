import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export type BookmarkListParams = {
  page?: number
  size?: number
}

export const bookmarkQueryOptions = {
  list: (params: BookmarkListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.bookmarks.list(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getBookmarks(params)),
    }),
}
