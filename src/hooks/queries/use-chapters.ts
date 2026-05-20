"use client"

import { useQuery } from "@tanstack/react-query"
import { chapterQueryOptions, type ChapterCommentsParams } from "@/lib/query/options/chapters"

export function useChapterDetailQuery(slug: string, chapterNumber: number) {
  return useQuery(chapterQueryOptions.detailBySlug(slug, chapterNumber))
}

export function useChapterCommentsQuery(chapterId: string, params: ChapterCommentsParams = {}) {
  return useQuery(chapterQueryOptions.comments(chapterId, params))
}

export function useChapterAudioQuery(chapterId: string) {
  return useQuery(chapterQueryOptions.audio(chapterId))
}
