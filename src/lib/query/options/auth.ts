import { queryOptions } from "@tanstack/react-query"
import type { ApiResponse, User } from "@/models"
import { api } from "@/services/api"
import type { ApiError } from "@/services/api-client"
import { queryKeys } from "@/lib/query/keys"

type AuthResponse = ApiResponse<
  | {
      id?: string
      username?: string
      email?: string
      roles?: string[]
    }
  | undefined
>

export function buildUserFromAuthData(payload?: AuthResponse["data"]): User | null {
  if (!payload?.id || !payload?.username || !payload?.email) {
    return null
  }

  return {
    id: String(payload.id),
    username: String(payload.username),
    email: String(payload.email),
    roles: payload.roles || [],
  }
}

export const authQueryOptions = {
  me: () =>
    queryOptions({
      queryKey: queryKeys.auth.me(),
      retry: false,
      queryFn: async (): Promise<User | null> => {
        try {
          const response = await api.getUserProfile()
          if (!response.success || !response.data) {
            return null
          }

          return {
            ...response.data,
            roles: response.data.roles || [],
          }
        } catch (error) {
          const apiError = error as ApiError
          if (apiError.status === 401 || apiError.status === 403) {
            return null
          }

          throw error
        }
      },
    }),
}
