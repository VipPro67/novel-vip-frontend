import type { FileMetadata } from "./file"

export interface Chapter {
  id: string
  chapterNumber: number
  title: string
  novelId: string
  novelTitle: string
  createdAt: string
  updatedAt: string
}

export interface MangaPage {
  pageNumber: number
  url: string
  width: number
  height: number
}

export interface MangaPayload {
  pages: MangaPage[]
}

export interface SubtitleTrack {
  language: string
  label: string
  url: string
}

export interface AnimePayload {
  playlistUrl: string
  duration: number
  subtitles: SubtitleTrack[]
}

export interface ChapterDetail extends Chapter {
  jsonUrl?: string
  audioUrl?: string
  jsonMetadata?: FileMetadata
  audioMetadata?: FileMetadata
  price?: number
  isLocked?: boolean
  isUnlocked?: boolean
  novelContentType?: "NOVEL" | "MANGA" | "ANIME"
  mangaContent?: MangaPayload
  animeContent?: AnimePayload
  content?: string
}

