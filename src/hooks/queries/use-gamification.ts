"use client"

import { useQuery } from "@tanstack/react-query"
import { gamificationQueryOptions } from "@/lib/query/options/gamification"

export function useGamificationProfileQuery() {
  return useQuery(gamificationQueryOptions.profile())
}
