import type { ApiResponse } from "@/models"

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    const error = Object.assign(new Error(response.message || "Request failed"), {
      status: response.statusCode,
      body: response,
    })

    throw error
  }

  return response.data
}
