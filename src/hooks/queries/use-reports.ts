"use client"

import { useQuery } from "@tanstack/react-query"
import { reportsQueryOptions, featureRequestsQueryOptions, type ReportListParams, type FeatureRequestListParams } from "@/lib/query/options/reports"

export function useMyReportsQuery(params: ReportListParams = {}) {
  return useQuery(reportsQueryOptions.mine(params))
}

export function useFeatureRequestsQuery(params: FeatureRequestListParams = {}) {
  return useQuery(featureRequestsQueryOptions.list(params))
}
