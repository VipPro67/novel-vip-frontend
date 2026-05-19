import { queryOptions } from "@tanstack/react-query"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

export const readerSettingsQueryOptions = {
  detail: (userId?: string) =>
    queryOptions({
      queryKey: queryKeys.readerSettings.detail(userId),
      queryFn: async () => unwrapApiResponse(await api.getReaderSettings()),
      enabled: Boolean(userId),
    }),
  fonts: () =>
    queryOptions({
      queryKey: queryKeys.readerSettings.fonts(),
      staleTime: Number.POSITIVE_INFINITY,
      queryFn: async () => unwrapApiResponse(await api.getFontOptions()),
    }),
  themes: () =>
    queryOptions({
      queryKey: queryKeys.readerSettings.themes(),
      staleTime: Number.POSITIVE_INFINITY,
      queryFn: async () => unwrapApiResponse(await api.getThemeOptions()),
    }),
}
