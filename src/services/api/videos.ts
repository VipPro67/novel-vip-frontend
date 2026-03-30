import type { 
  CreateVideoPayload, 
  UpdateVideoPayload, 
  PageResponse, 
  Video, 
  VideoSeries, 
  CreateVideoSeriesPayload, 
  UpdateVideoSeriesPayload 
} from "@/models"
import type { ApiClient } from "../api-client"

export const createVideosApi = (client: ApiClient) => ({
  async getVideos(
    params: {
      page?: number
      size?: number
      sortBy?: string
      sortDir?: string
      search?: string
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    const page = params.page ?? 0
    const size = params.size ?? 12
    const sortBy = params.sortBy ?? "createdAt"
    const sortDir = params.sortDir ?? "desc"

    searchParams.append("page", page.toString())
    searchParams.append("size", size.toString())
    searchParams.append("sortBy", sortBy)
    searchParams.append("sortDir", sortDir)

    if (params.search && params.search.trim().length > 0) {
      searchParams.append("search", params.search.trim())
    }

    return client.request<PageResponse<Video>>(`/api/videos?${searchParams.toString()}`)
  },

  async getVideo(videoId: string) {
    return client.request<Video>(`/api/videos/${videoId}`)
  },

  async createVideo(payload: CreateVideoPayload) {
    return client.request<Video>("/api/videos", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async updateVideo(videoId: string, payload: UpdateVideoPayload) {
    return client.request<Video>(`/api/videos/${videoId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  async deleteVideo(videoId: string) {
    return client.request<void>(`/api/videos/${videoId}`, {
      method: "DELETE",
    })
  },

  async getVideoSeriesList(
    params: {
      page?: number
      size?: number
      sortBy?: string
      sortDir?: string
      search?: string
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    const page = params.page ?? 0
    const size = params.size ?? 12
    const sortBy = params.sortBy ?? "createdAt"
    const sortDir = params.sortDir ?? "desc"

    searchParams.append("page", page.toString())
    searchParams.append("size", size.toString())
    searchParams.append("sortBy", sortBy)
    searchParams.append("sortDir", sortDir)

    if (params.search && params.search.trim().length > 0) {
      searchParams.append("search", params.search.trim())
    }

    return client.request<PageResponse<VideoSeries>>(`/api/video-series?${searchParams.toString()}`)
  },

  async getVideoSeries(seriesId: string) {
    return client.request<VideoSeries>(`/api/video-series/${seriesId}`)
  },

  async createVideoSeries(payload: CreateVideoSeriesPayload) {
    return client.request<VideoSeries>("/api/video-series", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async updateVideoSeries(seriesId: string, payload: UpdateVideoSeriesPayload) {
    return client.request<VideoSeries>(`/api/video-series/${seriesId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  async deleteVideoSeries(seriesId: string) {
    return client.request<void>(`/api/video-series/${seriesId}`, {
      method: "DELETE",
    })
  }
})
