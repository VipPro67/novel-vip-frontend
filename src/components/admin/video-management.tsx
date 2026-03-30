"use client"

import { useEffect, useMemo, useState } from "react"
import { PlayCircle, Search, Video as VideoIcon, Loader2, RotateCw, ListVideo, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import type { CreateVideoPayload, Video, VideoSeries, CreateVideoSeriesPayload } from "@/models"
import { formatRelativeTime } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VideoFormState extends CreateVideoPayload {}

const INITIAL_VIDEO_FORM: VideoFormState = {
  title: "",
  description: "",
  videoUrl: "",
  videoSeriesId: undefined,
}

const INITIAL_SERIES_FORM: CreateVideoSeriesPayload = {
  title: "",
  description: "",
}

export function VideoManagement() {
  return (
    <div className="space-y-8">
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="series">Video Series</TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-6">
          <VideoTab />
        </TabsContent>
        <TabsContent value="series" className="mt-6">
          <VideoSeriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VideoTab() {
  const { toast } = useToast()
  const [videos, setVideos] = useState<Video[]>([])
  const [seriesList, setSeriesList] = useState<VideoSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState<VideoFormState>(INITIAL_VIDEO_FORM)

  useEffect(() => {
    void fetchVideos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm])

  useEffect(() => {
    api.getVideoSeriesList({ size: 100, sortBy: "title", sortDir: "asc" }).then((res) => {
      if (res.success && res.data) {
        setSeriesList(res.data.content)
      }
    })
  }, [])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await api.getVideos({
        page,
        size: pageSize,
        sortBy: "createdAt",
        sortDir: "desc",
        search: searchTerm || undefined,
      })

      if (response.success && response.data) {
        const data = response.data
        setVideos(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load videos",
          description: response.message || "Please try again later.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load videos",
        description: error?.message ?? "Please try again later.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.title.trim() || !form.videoUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Title and video URL are required.",
      })
      return
    }

    setCreating(true)
    try {
      const payload: CreateVideoPayload = {
        title: form.title.trim(),
        description: form.description?.trim(),
        videoUrl: form.videoUrl.trim(),
        videoSeriesId: form.videoSeriesId && form.videoSeriesId !== "none" ? form.videoSeriesId : undefined,
      }
      const response = await api.createVideo(payload)
      if (response.success) {
        toast({
          title: "Video added",
          description: `${response.data.title} is now available.`,
        })
        setForm(INITIAL_VIDEO_FORM)
        setPage(0)
        setSearchTerm("")
        setSearchInput("")
        await fetchVideos()
      } else {
        toast({
          variant: "destructive",
          title: "Unable to add video",
          description: response.message || "Please verify the information and try again.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unable to add video",
        description: error?.message ?? "Please verify the information and try again.",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      const res = await api.deleteVideo(id)
      if (res.success) {
        toast({ title: "Video deleted" })
        fetchVideos()
      } else {
        toast({ variant: "destructive", title: "Cannot delete video" })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSearch = () => {
    setPage(0)
    setSearchTerm(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setSearchTerm("")
    setPage(0)
  }

  const canGoPrev = useMemo(() => page > 0, [page])
  const canGoNext = useMemo(() => page + 1 < totalPages, [page, totalPages])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5" />
            Add New Video
          </CardTitle>
          <CardDescription>Support YouTube and Facebook video URLs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Enter a descriptive title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL *</label>
              <Input
                value={form.videoUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to Series (Optional)</label>
            <Select 
              value={form.videoSeriesId || "none"} 
              onValueChange={(val) => setForm(prev => ({ ...prev, videoSeriesId: val === "none" ? undefined : val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Video Series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- No Series --</SelectItem>
                {seriesList.map(series => (
                  <SelectItem key={series.id} value={series.id}>{series.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Optional context or notes about the video"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <><PlayCircle className="mr-2 h-4 w-4" />Add Video</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Video Library
            </CardTitle>
            <CardDescription>
              {totalElements.toLocaleString()} video{totalElements === 1 ? "" : "s"} available
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <div className="flex w-full gap-2">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by title..."
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="secondary" onClick={handleSearch} disabled={loading}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
            {searchTerm && (
              <Button variant="ghost" onClick={handleClearSearch} className="md:w-auto">
                <RotateCw className="mr-2 h-4 w-4" /> Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4 animate-pulse">
                  <div className="aspect-video w-full rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <VideoIcon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No videos found.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => {
                const series = seriesList.find((s) => s.id === video.videoSeriesId)
                return (
                  <div key={video.id} className="space-y-3 rounded-lg border p-4 group">
                    <div className="aspect-video overflow-hidden rounded-md border">
                      <iframe
                        src={video.embedUrl}
                        title={video.title}
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold leading-tight">{video.title}</h3>
                        {series && <Badge variant="outline" className="mt-1">{series.title}</Badge>}
                      </div>
                      <Badge variant="secondary">{video.platform.toLowerCase()}</Badge>
                    </div>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                    )}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t">
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(video.createdAt)}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(video.id, video.title)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={!canGoPrev || loading}>Previous</Button>
              <p className="text-sm text-muted-foreground">Page {page + 1} of {Math.max(totalPages, 1)}</p>
              <Button variant="outline" onClick={() => setPage((p) => (canGoNext ? p + 1 : p))} disabled={!canGoNext || loading}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function VideoSeriesTab() {
  const { toast } = useToast()
  const [seriesList, setSeriesList] = useState<VideoSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState<CreateVideoSeriesPayload>(INITIAL_SERIES_FORM)

  useEffect(() => {
    void fetchSeries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm])

  const fetchSeries = async () => {
    setLoading(true)
    try {
      const response = await api.getVideoSeriesList({
        page,
        size: pageSize,
        sortBy: "createdAt",
        sortDir: "desc",
        search: searchTerm || undefined,
      })

      if (response.success && response.data) {
        const data = response.data
        setSeriesList(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } else {
        toast({ variant: "destructive", title: "Failed to load video series" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to load video series" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Title required" })
      return
    }
    setCreating(true)
    try {
      const res = await api.createVideoSeries({
        title: form.title.trim(),
        description: form.description?.trim(),
      })
      if (res.success) {
        toast({ title: "Video Series created" })
        setForm(INITIAL_SERIES_FORM)
        fetchSeries()
      } else {
        toast({ variant: "destructive", title: "Failed to create series" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Cannot create series" })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      const res = await api.deleteVideoSeries(id)
      if (res.success) {
        toast({ title: "Series deleted" })
        fetchSeries()
      } else {
        toast({ variant: "destructive", title: "Cannot delete series" })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSearch = () => {
    setPage(0)
    setSearchTerm(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setSearchTerm("")
    setPage(0)
  }

  const canGoPrev = useMemo(() => page > 0, [page])
  const canGoNext = useMemo(() => page + 1 < totalPages, [page, totalPages])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListVideo className="h-5 w-5" />
            Create Video Series
          </CardTitle>
          <CardDescription>Group videos into a cohesive series.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="e.g. Arc 1: The Beginning"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Optional overview of this video series"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Create Series"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListVideo className="h-5 w-5" />
              Series Library
            </CardTitle>
            <CardDescription>{totalElements.toLocaleString()} series available</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <div className="flex w-full gap-2">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search series..."
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="secondary" onClick={handleSearch} disabled={loading}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
            {searchTerm && (
              <Button variant="ghost" onClick={handleClearSearch} className="md:w-auto">
                <RotateCw className="mr-2 h-4 w-4" /> Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
             <div className="flex items-center justify-center p-8">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : seriesList.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No video series found.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {seriesList.map(series => (
                <div key={series.id} className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div>
                    <h3 className="font-semibold">{series.title}</h3>
                    {series.description && <p className="text-sm text-muted-foreground mt-1">{series.description}</p>}
                    <p className="text-xs text-muted-foreground mt-2">Created: {formatRelativeTime(series.createdAt)}</p>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(series.id, series.title)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={!canGoPrev || loading}>Previous</Button>
              <p className="text-sm text-muted-foreground">Page {page + 1} of {Math.max(totalPages, 1)}</p>
              <Button variant="outline" onClick={() => setPage((p) => (canGoNext ? p + 1 : p))} disabled={!canGoNext || loading}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
