"use client"

import { useQuery } from "@tanstack/react-query"
import { adminQueryOptions, type AdminListParams } from "@/lib/query/options/admin"

export function useAdminDashboardQuery() {
  return useQuery(adminQueryOptions.dashboard())
}

export function useAdminUsersQuery(params: AdminListParams = {}) {
  return useQuery(adminQueryOptions.users(params))
}

export function useAdminNovelsQuery(params: AdminListParams = {}) {
  return useQuery(adminQueryOptions.novels(params))
}
