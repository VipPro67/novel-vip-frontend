import type { ApiResponse } from "@/models"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

export type ApiError = Error & {
  status?: number
  body?: ApiResponse<unknown> | null
}

export class ApiClient {
  constructor(public readonly baseURL: string) {}

  private isRefreshing = false
  private failedRequestsQueue: Array<{
    resolve: () => void
    reject: (reason?: unknown) => void
  }> = []

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) }
    const isFormData = options.body instanceof FormData

    if (!isFormData) {
      headers["Content-Type"] = "application/json"
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Always send cookies (accessToken + refreshToken)
      })

      const contentType = response.headers.get("content-type") || ""
      const responseText = await response.text()
      let parsedBody: ApiResponse<T> | null = null

      if (responseText && contentType.includes("application/json")) {
        try {
          parsedBody = JSON.parse(responseText) as ApiResponse<T>
        } catch (parseError) {
          console.warn("Failed to parse JSON response", parseError)
        }
      }

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes("/auth/signin")) {
          if (!this.isRefreshing) {
            this.isRefreshing = true
            try {
              const refreshOk = await this.refreshToken()
              if (refreshOk) {
                this.processQueue(null)
                // Retry the original request — new accessToken cookie is already set
                return this.request<T>(endpoint, options)
              } else {
                throw new Error("Refresh failed")
              }
            } catch (refreshError) {
              this.processQueue(refreshError)
              const fallbackMessage = "Authentication failed. Please login again."
              const message = parsedBody?.message || fallbackMessage
              const error: ApiError = Object.assign(new Error(message), {
                status: response.status,
                body: parsedBody as ApiResponse<unknown> | null,
              })
              throw error
            } finally {
              this.isRefreshing = false
            }
          } else {
            // Queue concurrent requests until refresh completes
            return new Promise((resolve, reject) => {
              this.failedRequestsQueue.push({
                resolve: () => {
                  resolve(this.request<T>(endpoint, options))
                },
                reject: (err) => {
                  reject(err)
                },
              })
            })
          }
        }

        let fallbackMessage = `Request failed with status ${response.status}`
        if (response.status === 401) {
          fallbackMessage = "Authentication failed. Please login again."
        } else if (response.status === 403) {
          fallbackMessage = "Access denied. Insufficient permissions."
        } else if (response.status === 404) {
          fallbackMessage = "Resource not found."
        } else if (response.status >= 500) {
          fallbackMessage = "Server error. Please try again later."
        }

        const message = parsedBody?.message || fallbackMessage
        const error: ApiError = Object.assign(new Error(message), {
          status: response.status,
          body: parsedBody as ApiResponse<unknown> | null,
        })
        throw error
      }

      if (parsedBody) {
        return parsedBody
      }

      return {
        success: true,
        message: "",
        data: undefined as T,
        statusCode: response.status,
      }
    } catch (error) {
      console.error("API Request Error:", error)
      throw error
    }
  }

  /**
   * Calls the refresh endpoint. The browser automatically sends the refreshToken
   * httpOnly cookie, and the server responds with a Set-Cookie for the new accessToken.
   * Returns true if the refresh was successful.
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // sends the refreshToken cookie
      })
      return response.ok
    } catch (error) {
      console.error("Error refreshing token:", error)
      return false
    }
  }

  private processQueue(error: unknown) {
    this.failedRequestsQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve()
      }
    })
    this.failedRequestsQueue = []
  }

  async get<T>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const createApiClient = (baseURL: string = API_BASE_URL) => new ApiClient(baseURL)
