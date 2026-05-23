"use client"

import { ApiResponse, User } from "@/models"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { buildUserFromAuthData, authQueryOptions } from "@/lib/query/options/auth"
import { queryKeys } from "@/lib/query/keys"
import { api } from "@/services/api"
import type { ApiError } from "@/services/api-client"
import type React from "react"
import { createContext, useContext } from "react"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResponse>
  loginWithGoogle: (credential: string) => Promise<AuthResponse>
  register: (username: string, email: string, password: string) => Promise<ApiResponse<string>>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  hasRole: (roles: string[]) => boolean
  refreshUser: () => Promise<void>
}

type AuthResponse = ApiResponse<
  | {
    id?: string
    username?: string
    email?: string
    roles?: string[]
  }
  | undefined
>

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const meQuery = useQuery(authQueryOptions.me())

  const applyAuthResponse = (response?: AuthResponse) => {
    if (!response?.success || !response.data) {
      return
    }

    const userData = buildUserFromAuthData(response.data)

    if (userData) {
      queryClient.setQueryData(queryKeys.auth.me(), userData)
    }
  }

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.login(email, password),
    onSuccess: applyAuthResponse,
  })

  const googleLoginMutation = useMutation({
    mutationFn: ({ credential }: { credential: string }) => api.loginWithGoogle(credential),
    onSuccess: applyAuthResponse,
  })

  const user = meQuery.data ?? null

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await loginMutation.mutateAsync({ email, password })
      return response
    } catch (error) {
      console.error("Login failed:", error)

      const apiError = error as ApiError | Error

      return {
        success: false,
        message: apiError instanceof Error ? apiError.message : "An error occurred",
        data: undefined,
        statusCode: (apiError as ApiError)?.status ?? 500,
      } as AuthResponse
    }
  }

  const loginWithGoogle = async (credential: string): Promise<AuthResponse> => {
    try {
      const response = await googleLoginMutation.mutateAsync({ credential })
      return response
    } catch (error) {
      console.error("Google login failed:", error)

      const apiError = error as ApiError | Error

      return {
        success: false,
        message: apiError instanceof Error ? apiError.message : "Unable to authenticate with Google",
        data: undefined,
        statusCode: (apiError as ApiError)?.status ?? 500,
      } as AuthResponse
    }
  }

  const register = async (
    username: string,
    email: string,
    password: string,
  ): Promise<ApiResponse<string>> => {
    return api.register(username, email, password)
  }

  const logout = async () => {
    try {
      await api.request("/api/auth/signout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      window.localStorage.removeItem("readerSettings")
      queryClient.setQueryData(queryKeys.auth.me(), null)
      queryClient.removeQueries({ queryKey: queryKeys.readerSettings.all })
    }
  }

  const hasRole = (roles: string[]): boolean => {
    if (!user) {
      return false
    }

    const userRoles = user.roles || []
    return userRoles.some((role: string) => roles.includes(role))
  }

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    loading: meQuery.isPending && meQuery.data === undefined,
    isAuthenticated: !!user,
    hasRole,
    refreshUser: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
      await queryClient.refetchQueries({ queryKey: queryKeys.auth.me(), exact: true })
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
