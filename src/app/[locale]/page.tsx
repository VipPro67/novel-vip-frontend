import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { HomePageContent } from "@/components/home/home-page-content"
import { getQueryClient } from "@/lib/query/get-query-client"
import { prefetchHomeNovelQueries } from "@/lib/query/options/novels"
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: "NovelVip – Read novels online for free",
    description: "Read your favorite novels online for free. NovelVip offers a vast collection of novels with daily updates.",
    openGraph: {
      title: "NovelVip – Read novels online for free",
      description: "Read your favorite novels online for free. NovelVip offers a vast collection of novels with daily updates.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "NovelVip – Read novels online for free",
      description: "Read your favorite novels online for free. NovelVip offers a vast collection of novels with daily updates.",
    },
  }
}

export default async function HomePage() {
  const queryClient = getQueryClient()
  await prefetchHomeNovelQueries(queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageContent />
    </HydrationBoundary>
  )
}
