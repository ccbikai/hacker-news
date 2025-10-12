import type { Metadata } from 'next'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/article-card'
import { podcastTitle } from '@/config'

export const revalidate = 3600

// 生成页面的元数据
export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { env } = await getCloudflareContext({ async: true })
  const runEnv = env.NEXTJS_ENV
  const date = (await params).date

  const post = (await env.AUTO_PODCAST_GENERATOR_KV.get(`content:${runEnv}:hacker-news:${date}`, 'json')) as unknown as Article

  if (!post) {
    return notFound()
  }

  const title = post.title
  const description = post.introContent || post.podcastContent?.slice(0, 200) || title
  const url = `${env.NEXT_STATIC_HOST}/post/${post.date}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: [podcastTitle],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ date: string }> }) {
  const { env } = await getCloudflareContext({ async: true })
  const runEnv = env.NEXTJS_ENV

  const date = (await params).date

  const post = (await env.AUTO_PODCAST_GENERATOR_KV.get(`content:${runEnv}:hacker-news:${date}`, 'json')) as unknown as Article

  if (!post) {
    return notFound()
  }

  return (
    <ArticleCard
      key={post.date}
      article={post}
      staticHost={env.NEXT_STATIC_HOST}
      showFooter
    />
  )
}
