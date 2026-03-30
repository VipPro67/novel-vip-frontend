export interface VideoSeries {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateVideoSeriesPayload {
  title: string
  description?: string
}

export interface UpdateVideoSeriesPayload {
  title: string
  description?: string
}

export interface Video {
  id: string
  title: string
  description?: string
  videoUrl: string
  embedUrl: string
  platform: "YOUTUBE" | "FACEBOOK"
  externalId?: string | null
  videoSeriesId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateVideoPayload {
  title: string
  description?: string
  videoUrl: string
  videoSeriesId?: string
}

export interface UpdateVideoPayload {
  title: string
  description?: string
  videoUrl: string
  videoSeriesId?: string
}
