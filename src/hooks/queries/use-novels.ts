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
