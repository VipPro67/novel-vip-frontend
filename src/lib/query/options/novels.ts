import { keepPreviousData, queryOptions, type QueryClient } from "@tanstack/react-query"
import type { Comment } from "@/models"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export type NovelListParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  search?: string
}

export type SearchNovelParams = {
  keyword?: string
  title?: string
  author?: string
  category?: string
  genre?: string
  tag?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export type NovelCommentsParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export function organizeComments(comments: Comment[]) {
  const commentMap = new Map<string, Comment & { replies: Comment[]; showReplies?: boolean }>()
  const rootComments: Array<Comment & { replies: Comment[]; showReplies?: boolean }> = []

  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
      showReplies: true,
    })
  })

  comments.forEach((comment) => {
    const current = commentMap.get(comment.id)
    if (!current) {
      return
    }

    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(current)
      }
    } else {
      rootComments.push(current)
    }
  })

  return rootComments
}

export const novelQueryOptions = {
  list: (params: NovelListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.list(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getNovels(params)),
    }),
  detailById: (id: string) =>
    queryOptions({
      queryKey: queryKeys.novels.detailById(id),
      queryFn: async () => unwrapApiResponse(await api.getNovelById(id)),
    }),
  detailBySlug: (slug: string) =>
    queryOptions({
      queryKey: queryKeys.novels.detailBySlug(slug),
      queryFn: async () => unwrapApiResponse(await api.getNovelBySlug(slug)),
    }),
  chapters: (novelId: string, params: NovelCommentsParams = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.chapters(novelId, params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getChaptersByNovel(novelId, params)),
      enabled: Boolean(novelId),
    }),
  latest: (params: { page?: number; size?: number } = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.latest(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getLatestNovels(params)),
    }),
  latestStats: () =>
    queryOptions({
      queryKey: queryKeys.novels.latestStats(),
      queryFn: async () => unwrapApiResponse(await api.getLatestUpdatesStats()),
    }),
  hot: (params: NovelListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.hot(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getHotNovels(params)),
    }),
  hotStats: () =>
    queryOptions({
      queryKey: queryKeys.novels.hotStats(),
      queryFn: async () => unwrapApiResponse(await api.getHotNovelsStats()),
    }),
  topRated: (params: NovelListParams = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.topRated(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getTopRatedNovels(params)),
    }),
  topRatedStats: () =>
    queryOptions({
      queryKey: queryKeys.novels.topRatedStats(),
      queryFn: async () => unwrapApiResponse(await api.getTopRatedNovelsStats()),
    }),
  search: (params: SearchNovelParams = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.search(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.searchNovels(params)),
    }),
  categories: () =>
    queryOptions({
      queryKey: queryKeys.novels.categories(),
      staleTime: Number.POSITIVE_INFINITY,
      queryFn: async () => unwrapApiResponse(await api.getCategories()),
    }),
  genres: () =>
    queryOptions({
      queryKey: queryKeys.novels.genres(),
      staleTime: Number.POSITIVE_INFINITY,
      queryFn: async () => unwrapApiResponse(await api.getGenres()),
    }),
  tags: () =>
    queryOptions({
      queryKey: queryKeys.novels.tags(),
      staleTime: Number.POSITIVE_INFINITY,
      queryFn: async () => unwrapApiResponse(await api.getTags()),
    }),
  readingHistory: (params: NovelCommentsParams = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.readingHistory(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getReadingHistory(params)),
    }),
  favorites: (params: NovelCommentsParams = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.favorites(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getFavorites(params)),
    }),
  favoriteStatus: (novelId: string) =>
    queryOptions({
      queryKey: queryKeys.novels.favoriteStatus(novelId),
      enabled: Boolean(novelId),
      queryFn: async () => unwrapApiResponse(await api.checkFavoriteStatus(novelId)),
    }),
  userRating: (novelId: string) =>
    queryOptions({
      queryKey: queryKeys.novels.userRating(novelId),
      enabled: Boolean(novelId),
      queryFn: async () => unwrapApiResponse(await api.getUserRating(novelId)),
    }),
  comments: (novelId: string, params: NovelCommentsParams = {}) =>
    queryOptions({
      queryKey: queryKeys.novels.comments(novelId, params),
      placeholderData: keepPreviousData,
      enabled: Boolean(novelId),
      queryFn: async () => unwrapApiResponse(await api.getNovelComments(novelId, params)),
    }),
}

export async function prefetchHomeNovelQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery(novelQueryOptions.hot({ size: 6 })),
    queryClient.prefetchQuery(novelQueryOptions.topRated({ size: 6 })),
    queryClient.prefetchQuery(novelQueryOptions.latest({ size: 6 })),
  ])
}
