"use client"

import { useQuery } from "@tanstack/react-query"
import { roleRequestsQueryOptions, type RoleRequestListParams } from "@/lib/query/options/role-requests"

export function useMyRoleRequestsQuery(params: RoleRequestListParams = {}) {
  return useQuery(roleRequestsQueryOptions.mine(params))
}

export function usePendingRoleRequestsQuery(params: RoleRequestListParams = {}) {
  return useQuery(roleRequestsQueryOptions.pending(params))
}
