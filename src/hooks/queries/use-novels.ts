"use client"

import { useQuery } from "@tanstack/react-query"
import { novelQueryOptions, type NovelListParams, type SearchNovelParams } from "@/lib/query/options/novels"

export function useNovelListQuery(params: NovelListParams = {}) {
  return useQuery(novelQueryOptions.list(params))
}

export function useLatestNovelsQuery(params: { page?: number; size?: number } = {}) {
  return useQuery(novelQueryOptions.latest(params))
}

export function useLatestNovelStatsQuery() {
  return useQuery(novelQueryOptions.latestStats())
}

export function useHotNovelsQuery(params: NovelListParams = {}) {
  return useQuery(novelQueryOptions.hot(params))
}

export function useHotNovelStatsQuery() {
  return useQuery(novelQueryOptions.hotStats())
}

export function useTopRatedNovelsQuery(params: NovelListParams = {}) {
  return useQuery(novelQueryOptions.topRated(params))
}

export function useTopRatedNovelStatsQuery() {
  return useQuery(novelQueryOptions.topRatedStats())
}

export function useNovelSearchQuery(params: SearchNovelParams | null) {
  return useQuery({
    ...novelQueryOptions.search(params ?? {}),
    enabled: Boolean(params),
  })
}

export function useNovelCategoriesQuery() {
  return useQuery(novelQueryOptions.categories())
}

export function useNovelGenresQuery() {
  return useQuery(novelQueryOptions.genres())
}

export function useNovelTagsQuery() {
  return useQuery(novelQueryOptions.tags())
}

export function useNovelDetailByIdQuery(id: string) {
  return useQuery(novelQueryOptions.detailById(id))
}

export function useNovelDetailBySlugQuery(slug: string) {
  return useQuery(novelQueryOptions.detailBySlug(slug))
}

export function useNovelChaptersQuery(novelId: string, params: any = {}) {
  return useQuery(novelQueryOptions.chapters(novelId, params))
}

export function useReadingHistoryQuery(params: any = {}) {
  return useQuery(novelQueryOptions.readingHistory(params))
}

export function useNovelFavoritesQuery(params: any = {}) {
  return useQuery(novelQueryOptions.favorites(params))
}

export function useNovelFavoriteStatusQuery(novelId: string) {
  return useQuery(novelQueryOptions.favoriteStatus(novelId))
}

export function useNovelUserRatingQuery(novelId: string) {
  return useQuery(novelQueryOptions.userRating(novelId))
}

export function useNovelCommentsQuery(novelId: string, params: any = {}) {
  return useQuery(novelQueryOptions.comments(novelId, params))
}

