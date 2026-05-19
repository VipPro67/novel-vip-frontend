"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowRight, TrendingUp, Star, BookOpen } from "lucide-react"
import { Link } from "@/navigation"
import { Button } from "@/components/ui/button"
import { NovelCard } from "@/components/novel/novel-card"
import { RecentlyReadSection } from "@/components/home/recently-read-section"
import { novelQueryOptions } from "@/lib/query/options/novels"
import { useTranslations } from "next-intl"

export function HomePageContent() {
  const t = useTranslations("Home")
  const latestQuery = useQuery(novelQueryOptions.latest({ size: 6 }))
  const hotQuery = useQuery(novelQueryOptions.hot({ size: 6 }))
  const topRatedQuery = useQuery(novelQueryOptions.topRated({ size: 6 }))

  const latestNovels = latestQuery.data?.content ?? []
  const hotNovels = hotQuery.data?.content ?? []
  const topRatedNovels = topRatedQuery.data?.content ?? []
  const loading = latestQuery.isPending || hotQuery.isPending || topRatedQuery.isPending

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <RecentlyReadSection />
          {loading ? (
            <NovelSectionSkeleton />
          ) : (
            <>
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t("latest")}</h2>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                    <Link href="/novels/latest">
                      <span className="hidden sm:inline">{t("viewAll")}</span>
                      <span className="sm:hidden">View</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                  {latestNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              </section>
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t("hot")}</h2>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                    <Link href="/novels/hot">
                      <span className="hidden sm:inline">{t("viewAll")}</span>
                      <span className="sm:hidden">View</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                  {hotNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              </section>
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t("top")}</h2>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                    <Link href="/novels/top">
                      <span className="hidden sm:inline">{t("viewAll")}</span>
                      <span className="sm:hidden">View</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                  {topRatedNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function NovelSectionSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <section key={i}>
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="space-y-3">
                <div className="aspect-[3/4] bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
