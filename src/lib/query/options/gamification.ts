import { queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export const gamificationQueryOptions = {
  profile: () =>
    queryOptions({
      queryKey: queryKeys.gamification.profile(),
      queryFn: async () => unwrapApiResponse(await api.getGamificationProfile()),
    }),
}
