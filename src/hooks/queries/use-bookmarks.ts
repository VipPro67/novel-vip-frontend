"use client"

import { useQuery } from "@tanstack/react-query"
import { bookmarkQueryOptions, type BookmarkListParams } from "@/lib/query/options/bookmarks"

export function useBookmarksQuery(params: BookmarkListParams = {}) {
  return useQuery(bookmarkQueryOptions.list(params))
}
