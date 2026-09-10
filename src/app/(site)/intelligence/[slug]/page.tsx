import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl, truncate } from '@/lib/seo'

type Args = { params: Promise<{ slug: string }> }

async function getArticle(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'intelligence',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Not found' }

  const description = truncate(article.summary, 160)
  const url = absoluteUrl(`/intelligence/${article.slug}`)

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url,
      publishedTime: article.publishedAt || undefined,
      section: article.category || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
  }
}

export default async function IntelligenceArticlePage({ params }: Args) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  // NOTE: this checks the flag only. Full subscriber-gated access control
  // (session lookup against Subscribers / a future paid-access collection)
  // is part of Phase 4 — "Future Subscription Capability" in the brief.
  const isGated = article.isSubscriberOnly

  const articleUrl = absoluteUrl(`/intelligence/${article.slug}`)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    datePublished: article.publishedAt || undefined,
    dateModified: article.updatedAt || article.publishedAt || undefined,
    articleSection: article.category || undefined,
    isAccessibleForFree: !isGated,
    author: { '@type': 'Organization', name: 'Nigeria Lex' },
    publisher: {
      '@type': 'Organization',
      name: 'Nigeria Lex',
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo-mark-512.png') },
    },
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Intelligence', item: absoluteUrl('/intelligence') },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  }

  return (
    <article className="container max-w-2xl py-16 md:py-20">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
        {article.category}
      </p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">{article.title}</h1>
      {article.publishedAt && (
        <p className="mt-3 text-[13px] text-slate">
          {new Date(article.publishedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}
      <p className="mt-6 text-[17px] leading-relaxed text-navy-ink">{article.summary}</p>

      {isGated ? (
        <div className="mt-10 rounded-sm border border-line bg-white p-8">
          <p className="font-serif text-lg text-navy">This item is for Nigeria Lex subscribers.</p>
          <p className="mt-2 text-[14px] text-slate">
            Subscribe to Nigeria Lex to receive full research, market intelligence and briefings.
          </p>
          <Link
            href="/subscribe"
            className="mt-5 inline-block rounded-sm bg-green px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper hover:bg-green-deep"
          >
            Subscribe
          </Link>
        </div>
      ) : (
        <div className="prose prose-sm mt-10 max-w-none">
          <RichText data={article.content} />
        </div>
      )}

      {article.pdfAttachment?.url && !isGated && (
        <a
          href={article.pdfAttachment.url}
          className="mt-8 inline-block text-[13px] font-semibold text-green"
          target="_blank"
          rel="noreferrer"
        >
          Download full PDF →
        </a>
      )}
    </article>
  )
}
