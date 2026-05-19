type Primitive = string | number | boolean | null | undefined
type QueryValue = Primitive | QueryValue[] | { [key: string]: QueryValue }

type QueryParams = Record<string, QueryValue>

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },
  readerSettings: {
    all: ["reader-settings"] as const,
    detail: (userId?: string) => ["reader-settings", { userId: userId ?? null }] as const,
    fonts: () => ["reader-settings", "fonts"] as const,
    themes: () => ["reader-settings", "themes"] as const,
  },
  novels: {
    all: ["novels"] as const,
    list: (params: QueryParams = {}) => ["novels", "list", params] as const,
    detailById: (id: string) => ["novels", "detail", { id }] as const,
    detailBySlug: (slug: string) => ["novels", "detail", { slug }] as const,
    chapters: (novelId: string, params: QueryParams = {}) => ["novels", "chapters", { novelId, ...params }] as const,
    latest: (params: QueryParams = {}) => ["novels", "latest", params] as const,
    latestStats: () => ["novels", "latest-stats"] as const,
    hot: (params: QueryParams = {}) => ["novels", "hot", params] as const,
    hotStats: () => ["novels", "hot-stats"] as const,
    topRated: (params: QueryParams = {}) => ["novels", "top-rated", params] as const,
    topRatedStats: () => ["novels", "top-rated-stats"] as const,
    search: (params: QueryParams = {}) => ["novels", "search", params] as const,
    categories: () => ["novels", "categories"] as const,
    genres: () => ["novels", "genres"] as const,
    tags: () => ["novels", "tags"] as const,
    readingHistory: (params: QueryParams = {}) => ["novels", "reading-history", params] as const,
    favorites: (params: QueryParams = {}) => ["novels", "favorites", params] as const,
    favoriteStatus: (novelId: string) => ["novels", "favorite-status", { novelId }] as const,
    userRating: (novelId: string) => ["novels", "user-rating", { novelId }] as const,
    comments: (novelId: string, params: QueryParams = {}) => ["novels", "comments", { novelId, ...params }] as const,
  },
  chapters: {
    all: ["chapters"] as const,
    detailBySlug: (slug: string, chapterNumber: number) =>
      ["chapters", "detail", { slug, chapterNumber }] as const,
    comments: (chapterId: string, params: QueryParams = {}) => ["chapters", "comments", { chapterId, ...params }] as const,
    audio: (chapterId: string) => ["chapters", "audio", { chapterId }] as const,
  },
  admin: {
    dashboard: () => ["admin", "dashboard"] as const,
    users: (params: QueryParams = {}) => ["admin", "users", params] as const,
    novels: (params: QueryParams = {}) => ["admin", "novels", params] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (params: QueryParams = {}) => ["notifications", "list", params] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },
  chat: {
    groups: () => ["chat", "groups"] as const,
    messages: (groupId: string) => ["chat", "messages", { groupId }] as const,
  },
  roleRequests: {
    mine: (params: QueryParams = {}) => ["role-requests", "mine", params] as const,
    pending: (params: QueryParams = {}) => ["role-requests", "pending", params] as const,
  },
  videos: {
    list: (params: QueryParams = {}) => ["videos", "list", params] as const,
  },
} as const
