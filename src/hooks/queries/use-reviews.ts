"use client"

import { useQuery } from "@tanstack/react-query"
import { reviewsQueryOptions, type ReviewListParams } from "@/lib/query/options/reviews"

export function useNovelReviewsQuery(novelId: string, params: ReviewListParams = {}) {
  return useQuery(reviewsQueryOptions.novel(novelId, params))
}
