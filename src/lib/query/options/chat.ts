import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export const chatQueryOptions = {
  groups: () =>
    queryOptions({
      queryKey: queryKeys.chat.groups(),
      queryFn: async () => unwrapApiResponse(await api.getAllGroups({ page: 0, size: 50 })),
    }),
  messages: (groupId: string) =>
    queryOptions({
      queryKey: queryKeys.chat.messages(groupId),
      enabled: Boolean(groupId),
      placeholderData: keepPreviousData,
      queryFn: async () => unwrapApiResponse(await api.getMessagesByGroup(groupId, { page: 0, size: 100 })),
    }),
}
