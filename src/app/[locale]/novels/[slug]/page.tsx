"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/navigation"
import Image from "next/image"
import { Link } from "@/navigation"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import {
  Heart,
  Star,
  Eye,
  BookOpen,
  MessageCircle,
  Play,
  Edit,
  Trash2,
  MoreVertical,
  Reply,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { formatRelativeTime } from "@/lib/utils"
import { Comment, Chapter, Novel, type Notification } from "@/models"
import {
  useNovelDetailBySlugQuery,
  useNovelChaptersQuery,
  useNovelFavoriteStatusQuery,
  useNovelUserRatingQuery,
  useNovelCommentsQuery,
} from "@/hooks/queries/use-novels"
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useRateNovelMutation,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "@/hooks/mutations/use-mutations"
import { organizeComments } from "@/lib/query/options/novels"

// Dynamic imports for heavy components
const ReportDialog = dynamic(() => import("@/components/report/report-dialog").then(mod => ({ default: mod.ReportDialog })), {
  loading: () => null,
})

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
  showReplies?: boolean
}

export default function NovelDetailPage() {
  const params = useParams()
  const slug = params.slug as string | undefined
  const router = useRouter()
  const t = useTranslations("NovelDetail")
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  // Pagination states
  const [chaptersPage, setChaptersPage] = useState(0)
  const [chaptersSize, setChaptersSize] = useState(50)
  const [jumpToChapter, setJumpToChapter] = useState("")

  // Form input states
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [tab, setTab] = useState("chapters") // default tab

  // Reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  // Visibility states for replies
  const [collapsedCommentIds, setCollapsedCommentIds] = useState<Record<string, boolean>>({})

  // Queries
  const { data: novel, isLoading: novelLoading, error: novelError } = useNovelDetailBySlugQuery(slug ?? "")

  const { data: chaptersData, isLoading: chaptersLoading } = useNovelChaptersQuery(
    novel?.id ?? "",
    {
      page: chaptersPage,
      size: chaptersSize,
      sortBy: "chapterNumber",
      sortDir: "asc",
    }
  )
  const chapters = chaptersData?.content ?? []
  const chaptersTotalPages = chaptersData?.totalPages ?? 0
  const chaptersTotalElements = chaptersData?.totalElements ?? 0

  const { data: isFavoriteData } = useNovelFavoriteStatusQuery(novel?.id ?? "")
  const isFavorite = isFavoriteData ?? false

  const { data: userRatingData } = useNovelUserRatingQuery(novel?.id ?? "")
  const userRating = userRatingData?.score ?? 0

  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useNovelCommentsQuery(
    novel?.id ?? "",
    {
      page: 0,
      size: 100,
      sortBy: "createdAt",
      sortDir: "asc",
    }
  )
  const rawComments = commentsData?.content ?? []
  const totalComments = commentsData?.totalElements ?? 0

  // Computed Comments Tree
  const comments = useMemo(() => organizeComments(rawComments) as CommentWithReplies[], [rawComments])

  // Mutations
  const addToFavoritesMutation = useAddToFavoritesMutation()
  const removeFromFavoritesMutation = useRemoveFromFavoritesMutation()
  const rateNovelMutation = useRateNovelMutation()
  const addCommentMutation = useAddCommentMutation()
  const updateCommentMutation = useUpdateCommentMutation()
  const deleteCommentMutation = useDeleteCommentMutation()

  // Real-time reply listener
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!novel) return

    const handler = (event: Event) => {
      const notification = (event as CustomEvent<Notification>).detail
      if (!notification) return
      if (notification.type !== "COMMENT") return

      setTab("comments")
      void refetchComments()
    }

    window.addEventListener("novelvip:notification", handler as EventListener)
    return () => window.removeEventListener("novelvip:notification", handler as EventListener)
  }, [novel?.id, refetchComments])

  const handleShowComments = () => {
    setTab("comments")
  }

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!novel) return

    try {
      if (isFavorite) {
        await removeFromFavoritesMutation.mutateAsync(novel.id)
        toast({ title: "Removed from favorites" })
      } else {
        await addToFavoritesMutation.mutateAsync(novel.id)
        toast({ title: "Added to favorites" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      })
    }
  }

  const handleRating = async (rating: number) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!novel) return

    try {
      await rateNovelMutation.mutateAsync({ novelId: novel.id, score: rating })
      toast({ title: "Rating submitted" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      })
    }
  }

  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!newComment.trim() || !novel) return

    try {
      await addCommentMutation.mutateAsync({
        content: newComment.trim(),
        novelId: novel.id,
      })
      setNewComment("")
      toast({ title: "Comment added successfully" })
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!replyContent.trim() || !novel) return

    try {
      await addCommentMutation.mutateAsync({
        content: replyContent.trim(),
        novelId: novel.id,
        parentId: parentId,
      })
      setReplyContent("")
      setReplyingTo(null)
      toast({ title: "Reply added successfully" })
    } catch (error) {
      console.error("Failed to add reply:", error)
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      })
    }
  }

  const handleEditComment = (comment: CommentWithReplies) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        data: { content: editContent.trim() },
      })
      setEditingComment(null)
      setEditContent("")
      toast({ title: "Comment updated successfully" })
    } catch (error) {
      console.error("Failed to update comment:", error)
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId)
      toast({ title: "Comment deleted successfully" })
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  const isRepliesVisible = (commentId: string) => !collapsedCommentIds[commentId]

  const toggleReplies = (commentId: string) => {
    setCollapsedCommentIds(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  const startReading = () => {
    if (chapters.length > 0) {
      const targetSlug = novel?.slug ?? slug
      if (!targetSlug) {
        return
      }
      router.push(`/novels/${targetSlug}/chapters/${chapters[0].chapterNumber}`)
    }
  }

  const handleJumpToChapter = () => {
    const chapterNum = Number.parseInt(jumpToChapter, 10)
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > chaptersTotalElements) {
      toast({
        title: "Invalid chapter number",
        description: `Please enter a number between 1 and ${chaptersTotalElements}`,
        variant: "destructive",
      })
      return
    }

    const targetSlug = novel?.slug ?? slug
    if (!targetSlug) {
      return
    }

    router.push(`/novels/${targetSlug}/chapters/${chapterNum}`)
    setJumpToChapter("")
  }

  const isCommentOwner = (comment: CommentWithReplies) => {
    return user && comment.userId === user.id
  }

  const formatRelativeDate = (dateString: string) => {
    const value = formatRelativeTime(dateString)
    return value || "just now"
  }

  const renderComment = (comment: CommentWithReplies, depth = 0) => {
    const maxDepth = 3
    const isMaxDepth = depth >= maxDepth
    const repliesOpen = isRepliesVisible(comment.id)

    return (
      <div key={comment.id} className={`space-y-3 ${depth > 0 ? "ml-6 pl-4 border-l-2 border-muted" : ""}`}>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{comment.username}</span>
                {comment.edited ||
                  (comment.createdAt !== comment.updatedAt && (
                    <Badge variant="secondary" className="text-xs">
                      edited
                    </Badge>
                  ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.updatedAt)}</span>
              {isCommentOwner(comment) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteComment(comment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <ReportDialog
                  reportType="COMMENT"
                  targetId={comment.id}
                  targetTitle={`Comment by ${comment.username}`}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
            </div>
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[80px]" />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingComment(null)
                    setEditContent("")
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleSaveEdit(comment.id)} disabled={!editContent.trim()}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>

              {/* Reply button and controls */}
              <div className="flex items-center space-x-2">
                {!isMaxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs"
                  >
                    <Reply className="mr-1 h-3 w-3" />
                    Reply
                  </Button>
                )}

                {comment.replies.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => toggleReplies(comment.id)} className="text-xs">
                    {repliesOpen ? (
                      <>
                        <ChevronUp className="mr-1 h-3 w-3" />
                        Hide {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-3 w-3" />
                        Show {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="space-y-2 mt-3">
                  <Textarea
                    placeholder={`Reply to ${comment.username}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyContent.trim() || addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Render replies */}
        {repliesOpen && comment.replies.length > 0 && (
          <div className="space-y-3">{comment.replies.map((reply) => renderComment(reply, depth + 1))}</div>
        )}
      </div>
    )
  }

  if (novelLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="aspect-[3/4] bg-muted rounded-lg" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (novelError || !novel) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t("errors.notFound")}</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Novel Cover and Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="aspect-[3/4] relative mb-3 sm:mb-4">
                  <Image
                    src={novel.imageUrl || "/placeholder.svg?height=600&width=450"}
                    alt={novel.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <Button onClick={startReading} className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base" size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    {t("actions.start")}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={isFavorite ? "default" : "outline"}
                      onClick={handleFavoriteToggle}
                      className="w-full"
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                      {isFavorite ? t("actions.favorited") : t("actions.favorite")}
                    </Button>

                    <Button variant="outline" className="w-full bg-transparent" onClick={handleShowComments}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {t("actions.comments")}
                      {totalComments > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                          {totalComments > 99 ? "99+" : totalComments}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  <ReportDialog
                    reportType="NOVEL"
                    targetId={novel.id}
                    targetTitle={novel.title}
                    trigger={
                      <Button variant="outline" className="w-full bg-transparent">
                        <Flag className="mr-2 h-4 w-4" />
                        {t("actions.report")}
                      </Button>
                    }
                  />

                  {/* Rating */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t("actions.rate")}</p>
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button key={rating} onClick={() => handleRating(rating)} className="p-1">
                          <Star
                            className={`h-5 w-5 ${
                              rating <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Description */}
            <Card className="mt-2">
              <CardHeader>
                <CardTitle>{t("labels.description")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{novel.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Novel Info */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Meta */}
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{novel.title}</h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-3 sm:mb-4">{t("labels.byAuthor", { author: novel.author })}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{novel.rating}/5</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{t("labels.views", { count: novel?.totalViews?.toLocaleString() ?? 0 })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{t("labels.chapters", { count: novel.totalChapters })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{t("labels.updated", { time: formatRelativeDate(novel.updatedAt) })}</span>
                  </div>
                  <Badge variant="secondary">{novel.status}</Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {novel.categories?.map((category) => (
                    <Badge key={category.id} variant="outline">
                      <Link href={`/search?category=${category.name}`}>{category.name}</Link>
                    </Badge>
                  ))}
                  {novel.genres &&
                    novel.genres.map((genre) => (
                      <Badge key={genre.id} variant="outline">
                        <Link href={`/search?genre=${genre.name}`}>{genre.name}</Link>
                      </Badge>
                    ))}
                  {novel.tags &&
                    novel.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        <Link href={`/search?tag=${tag.name}`}>{tag.name}</Link>
                      </Badge>
                    ))}
                </div>
              </div>
              {/* Tabs */}
              <Tabs value={tab} onValueChange={setTab} defaultValue="chapters" className="w-full mt-4 sm:mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chapters" className="text-sm sm:text-base">
                    <span className="hidden sm:inline">{t("tabs.chapters")}</span>
                    <span className="sm:hidden">Ch.</span>
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="text-sm sm:text-base">
                    {t("tabs.comments")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chapters" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl">
                        {t("chapters.title", { count: chaptersTotalElements })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                            <span>
                              {t("chapters.showing", { page: chaptersPage + 1, total: Math.max(1, chaptersTotalPages) })}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                            <select
                                value={chaptersSize}
                                onChange={(e) => {
                                  const newSize = Number(e.target.value)
                                  setChaptersSize(newSize)
                                  setChaptersPage(0) // Reset to first page when changing size
                                }}
                                className="h-8 rounded-md border border-input bg-transparent px-2 sm:px-3 py-1 text-xs sm:text-sm ring-offset-background 
                                         focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              <option value={10}>{t("chapters.perPage", { count: 10 })}</option>
                              <option value={20}>{t("chapters.perPage", { count: 20 })}</option>
                              <option value={50}>{t("chapters.perPage", { count: 50 })}</option>
                              <option value={100}>{t("chapters.perPage", { count: 100 })}</option>
                            </select>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input
                                  type="number"
                                  min="1"
                                  max={chaptersTotalElements}
                                  value={jumpToChapter}
                                  onChange={(e) => setJumpToChapter(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleJumpToChapter()
                                    }
                                  }}
                                  placeholder={t("chapters.gotoPlaceholder")}
                                  className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background 
                                           focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full sm:w-32"
                              />
                              <Button
                                  size="sm"
                                  onClick={handleJumpToChapter}
                                  disabled={!jumpToChapter || chaptersLoading}
                                  className="whitespace-nowrap"
                              >
                                {t("actions.go")}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {chaptersLoading ? (
                              <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                                ))}
                              </div>
                          ) : (
                              chapters.map((chapter) => (
                                  <Link
                                      key={chapter.id}
                                      href={`/novels/${novel.slug}/chapters/${chapter.chapterNumber}`}
                                      className="block p-3 sm:p-4 rounded-lg border hover:bg-muted transition-colors touch-manipulation"
                                  >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                                      <div className="flex justify-between w-full">
                                        <p className="font-medium text-sm sm:text-base line-clamp-2 sm:line-clamp-1 flex-1">
                                          {chapter.title}
                                        </p>
                                        <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap ml-2">
                                          Updated {formatRelativeDate(chapter.updatedAt)}
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                              ))
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                          <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-2 sm:px-4 text-xs sm:text-sm"
                              onClick={() => setChaptersPage((p) => Math.max(0, p - 1))}
                              disabled={chaptersPage <= 0 || chaptersLoading}
                          >
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden xs:inline">{t("actions.prev")}</span>
                            <span className="xs:hidden">{t("actions.prev")}</span>
                          </Button>
                          <div className="flex items-center gap-1 text-xs sm:text-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hidden xs:flex"
                                onClick={() => setChaptersPage(0)}
                                disabled={chaptersPage === 0}
                            >
                              {t("actions.first")}
                            </Button>
                            <span className="text-muted-foreground px-2 whitespace-nowrap">
                              {chaptersPage + 1}/{Math.max(1, chaptersTotalPages)}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hidden xs:flex"
                                onClick={() => setChaptersPage(Math.max(0, chaptersTotalPages - 1))}
                                disabled={chaptersPage >= chaptersTotalPages - 1}
                            >
                              {t("actions.last")}
                            </Button>
                          </div>
                          <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-2 sm:px-4 text-xs sm:text-sm"
                              onClick={() => setChaptersPage((p) => Math.min(chaptersTotalPages - 1, p + 1))}
                              disabled={chaptersPage >= chaptersTotalPages - 1 || chaptersLoading}
                          >
                            <span className="hidden xs:inline">{t("actions.next")}</span>
                            <span className="xs:hidden">{t("actions.next")}</span>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  {/* Add Comment Form */}
                  {isAuthenticated ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("comments.addTitle")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Textarea
                                placeholder={t("comments.placeholder")}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <Button onClick={handleCommentSubmit} disabled={!newComment.trim() || addCommentMutation.isPending}>
                              {addCommentMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("actions.posting")}
                                  </>
                              ) : (
                                  <>
                                    <Send className="mr-2 h-4 w-4" />
                                    {t("actions.postComment")}
                                  </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                  ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground mb-4">{t("comments.loginPrompt")}</p>
                          <Button asChild>
                            <Link href="/login">{t("actions.login")}</Link>
                          </Button>
                        </CardContent>
                      </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("comments.title", { count: totalComments })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {commentsLoading ? (
                          <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="animate-pulse space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="h-8 w-8 bg-muted rounded-full" />
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-3 w-16 bg-muted rounded" />
                                  </div>
                                  <div className="h-16 bg-muted rounded" />
                                </div>
                            ))}
                          </div>
                      ) : comments.length > 0 ? (
                          <div className="space-y-6">{comments.map((comment) => renderComment(comment))}</div>
                      ) : (
                          <div className="text-center py-8">
                            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">{t("comments.empty")}</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
