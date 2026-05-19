"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Grid, List, Trophy, Star, Award, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NovelCard } from "@/components/novel/novel-card"
import { Pagination } from "@/components/ui/pagination"
import { novelQueryOptions } from "@/lib/query/options/novels"

export default function TopRatedNovelsPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const topRatedQuery = useQuery(novelQueryOptions.topRated({ page: currentPage, size: 20 }))
  const statsQuery = useQuery(novelQueryOptions.topRatedStats())

  const novels = topRatedQuery.data?.content ?? []
  const totalPages = topRatedQuery.data?.totalPages ?? 0
  const stats = statsQuery.data ?? {
    fiveStarNovels: 0,
    fourPlusStarNovels: 0,
    hallOfFame: 0,
    highlyRatedAvg: 0,
  }
  const loading = topRatedQuery.isPending

  const getTrophyBadge = (index: number) => {
    if (index === 0) {
      return <Badge className="bg-yellow-500 text-white">🏆 #1</Badge>
    }
    if (index === 1) {
      return <Badge className="bg-gray-400 text-white">🥈 #2</Badge>
    }
    if (index === 2) {
      return <Badge className="bg-amber-600 text-white">🥉 #3</Badge>
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-3xl font-bold">Top Rated Novels</h1>
                <p className="text-muted-foreground">The highest rated stories by our community</p>
              </div>
            </div>

            <div className="flex border rounded-md">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">5 Stars</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.fiveStarNovels}</div>
                <p className="text-xs text-muted-foreground">perfect rated novels</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">4+ Stars</CardTitle>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.fourPlusStarNovels.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">highly rated novels</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hall of Fame</CardTitle>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.hallOfFame}</div>
                <p className="text-xs text-muted-foreground">legendary novels</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highly Rated</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highlyRatedAvg}</div>
                <p className="text-xs text-muted-foreground">average rating</p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "grid-cols-1"
              }`}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : novels.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No top rated novels found</p>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "grid-cols-1"
              }`}
            >
              {novels.map((novel, index) => (
                <div key={novel.id} className="relative">
                  <NovelCard novel={novel} />
                  {getTrophyBadge(index) ? <div className="absolute top-2 left-2 z-10">{getTrophyBadge(index)}</div> : null}
                </div>
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showPageNumbers={true}
            className="mt-8"
          />
        </div>
      </main>
    </div>
  )
}
