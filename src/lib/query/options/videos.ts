import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export type VideoListParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  search?: string
}

export const videosQueryOptions = {
  list: (params: VideoListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.videos.list(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getVideos(params)),
    }),
  detail: (videoId: string) =>
    queryOptions({
      queryKey: queryKeys.videos.detail(videoId),
      enabled: Boolean(videoId),
      queryFn: async () => unwrapApiResponse(await api.getVideo(videoId)),
    }),
  seriesList: (params: VideoListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.videos.seriesList(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getVideoSeriesList(params)),
    }),
  seriesDetail: (seriesId: string) =>
    queryOptions({
      queryKey: queryKeys.videos.seriesDetail(seriesId),
      enabled: Boolean(seriesId),
      queryFn: async () => unwrapApiResponse(await api.getVideoSeries(seriesId)),
    }),
}
