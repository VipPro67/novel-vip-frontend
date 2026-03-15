import type { ApiClient } from "../api-client"

export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalNovels: number
  popularNovels: number
  totalChapters: number
  chaptersToday: number
  totalViews: number
  viewsGrowth: number
  activeUsers: number
  avgRating: number
  commentsToday: number
  commentsGrowth: number
}

export const createAdminDashboardApi = (client: ApiClient) => ({
  async getDashboardStats() {
    return client.request<DashboardStats>("/api/admin/dashboard/stats")
  },
})
