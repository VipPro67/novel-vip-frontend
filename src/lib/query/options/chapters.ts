import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export type ChapterCommentsParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export const chapterQueryOptions = {
  detailBySlug: (slug: string, chapterNumber: number) =>
    queryOptions({
      queryKey: queryKeys.chapters.detailBySlug(slug, chapterNumber),
      queryFn: async () => unwrapApiResponse(await api.getChapterByNumber2(slug, chapterNumber)),
      enabled: Boolean(slug) && chapterNumber !== undefined && chapterNumber >= 0,
    }),
  comments: (chapterId: string, params: ChapterCommentsParams = {}) =>
    queryOptions({
      queryKey: queryKeys.chapters.comments(chapterId, params),
      placeholderData: keepPreviousData,
      enabled: Boolean(chapterId),
      queryFn: async () => unwrapApiResponse(await api.getChapterComments(chapterId, params)),
    }),
  audio: (chapterId: string) =>
    queryOptions({
      queryKey: queryKeys.chapters.audio(chapterId),
      enabled: Boolean(chapterId),
      queryFn: async () => unwrapApiResponse(await api.getChapterAudio(chapterId)),
    }),
}
