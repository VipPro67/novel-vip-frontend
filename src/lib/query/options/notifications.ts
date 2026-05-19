import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export const notificationsQueryOptions = {
  list: (params: { page?: number; size?: number; sortBy?: string; sortDir?: string; read?: boolean } = {}) =>
    queryOptions({
      queryKey: queryKeys.notifications.list(params),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getNotifications(params)),
    }),
  unreadCount: () =>
    queryOptions({
      queryKey: queryKeys.notifications.unreadCount(),
      queryFn: async () => unwrapApiResponse(await api.getUnreadNotificationCount()),
    }),
}
