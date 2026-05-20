"use client"

import { useQuery } from "@tanstack/react-query"
import { videosQueryOptions, type VideoListParams } from "@/lib/query/options/videos"

export function useVideosQuery(params: VideoListParams = {}) {
  return useQuery(videosQueryOptions.list(params))
}

export function useVideoDetailQuery(videoId: string) {
  return useQuery(videosQueryOptions.detail(videoId))
}

export function useVideoSeriesListQuery(params: VideoListParams = {}) {
  return useQuery(videosQueryOptions.seriesList(params))
}

export function useVideoSeriesDetailQuery(seriesId: string) {
  return useQuery(videosQueryOptions.seriesDetail(seriesId))
}
