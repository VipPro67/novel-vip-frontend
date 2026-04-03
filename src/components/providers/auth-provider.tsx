"use client"

import { ApiResponse, User } from "@/models"
import { api } from "@/services/api"
import type { ApiError } from "@/services/api-client"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResponse>
  loginWithGoogle: (credential: string) => Promise<AuthResponse>
  register: (username: string, email: string, password: string) => Promise<ApiResponse<string>>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  hasRole: (role: string[]) => boolean
  refreshUser: () => Promise<void>
}
type AuthResponse = ApiResponse<{
  id?: string
  username?: string
  email?: string
  roles?: string[]
} | undefined>

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, try fetching the user profile — the httpOnly accessToken cookie
    // is sent automatically. If it fails/expires the 401 handler will try to refresh.
    fetchUserProfile()
  }, [])

  const buildUserFromAuthData = (payload?: AuthResponse["data"]): User | null => {
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

  const applyAuthResponse = (response?: AuthResponse) => {
    if (!response?.success || !response.data) {
      return
    }

    const userData = buildUserFromAuthData(response.data)
    if (userData) {
      setUser(userData)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await api.getUserProfile()
      if (response.success) {
        setUser((prevUser) => ({
          ...response.data,
          roles: prevUser?.roles || response.data.roles || [],
        }))
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.login(email, password)
      applyAuthResponse(response)
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
      const response = await api.loginWithGoogle(credential)
      applyAuthResponse(response)
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

  const register = async (username: string, email: string, password: string): Promise<ApiResponse<string>> => {
    const response = await api.register(username, email, password)
    return response
  }

  const logout = async () => {
    try {
      // Ask the server to clear the httpOnly cookies
      await api.request("/api/auth/signout", { method: "POST" })
    } catch {
      // ignore — clear local state regardless
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("readerSettings")
    }
    setUser(null)
  }

  const hasRole = (role: string[]): boolean => {
    if (!user) {
      return false
    }
    for (const r of role) {
      if (user.roles.includes(r)) {
        return true
      }
    }
    return false
  }

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    hasRole,
    refreshUser: fetchUserProfile,
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
