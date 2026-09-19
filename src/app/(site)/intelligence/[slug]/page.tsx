import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl, truncate } from '@/lib/seo'
import { canAccessLevel, levelOf } from '@/access'
import { getViewer } from '@/lib/viewer'
import { getPortalConfig } from '@/lib/portal'

type Args = { params: Promise<{ slug: string }> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getArticle(slug: string, viewer: any = null) {
  // Guarded like every other data-fetch on the public site (see Header,
  // Footer, the /intelligence list page, etc.) — a transient DB error here
  // previously bubbled up as an unhandled 500 instead of a clean 404.
  try {
    const payload = await getPayloadClient()
    // overrideAccess: false => the collection's own rules apply here:
    //  • unpublished / future-dated items are hidden from non-staff
    //  • the full `content` (and any restricted download) is only returned if
    //    the viewer's access level allows it — enforced by the API, not the UI.
    const result = await payload.find({
      collection: 'intelligence',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      overrideAccess: false,
      user: viewer ?? undefined,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
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
  // Reading the session makes this page render per request (not cached), which
  // is what per-viewer content requires.
  const viewer = await getViewer()
  const article = await getArticle(slug, viewer)
  if (!article) notFound()

  const level = levelOf(article)
  const allowed = canAccessLevel(level, viewer)
  const isGated = level !== 'public'
  const portal = await getPortalConfig()
  const isMemberViewer = viewer?.collection === 'members'
  const nextParam = encodeURIComponent(`/intelligence/${article.slug}`)

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

      {!allowed ? (
        <div className="mt-10 rounded-sm border border-line bg-white p-8">
          <p className="font-serif text-lg text-navy">
            {level === 'registered'
              ? 'This item is available to registered users.'
              : 'This item is for Nigeria Lex subscribers and institutional users.'}
          </p>
          {portal.enabled ? (
            <>
              <p className="mt-2 text-[14px] text-slate">
                {isMemberViewer
                  ? 'Your account currently has registered access. Contact us about subscriber or institutional access.'
                  : level === 'registered'
                    ? 'Sign in, or create a free account, to read the full item.'
                    : 'Sign in with a subscriber account to read the full item.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {isMemberViewer ? (
                  <Link
                    href="/contact"
                    className="inline-block rounded-sm bg-green px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper hover:bg-green-deep"
                  >
                    Contact us
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/account/login?next=${nextParam}`}
                      className="inline-block rounded-sm bg-green px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper hover:bg-green-deep"
                    >
                      Sign in
                    </Link>
                    {portal.registrationOpen && (
                      <Link
                        href={`/account/register?next=${nextParam}`}
                        className="inline-block rounded-sm border border-green px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-green hover:bg-mist"
                      >
                        Create account
                      </Link>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-[14px] text-slate">
                Subscribe to Nigeria Lex to receive full research, market intelligence and briefings.
              </p>
              <Link
                href="/subscribe"
                className="mt-5 inline-block rounded-sm bg-green px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper hover:bg-green-deep"
              >
                Subscribe
              </Link>
            </>
          )}
        </div>
      ) : article.content ? (
        <div className="prose prose-sm mt-10 max-w-none">
          <RichText data={article.content} />
        </div>
      ) : null}

      {allowed && article.pdfAttachment?.url && (
        <a
          href={article.pdfAttachment.url}
          className="mt-8 inline-block text-[13px] font-semibold text-green"
          target="_blank"
          rel="noreferrer"
        >
          Download full PDF →
        </a>
      )}

      {/* Login-protected report: served by /api/restricted-documents/file/…,
          which re-checks the viewer's access level on every download. */}
      {allowed && article.restrictedAttachment?.url && (
        <a
          href={article.restrictedAttachment.url}
          className="mt-8 block text-[13px] font-semibold text-green"
          target="_blank"
          rel="noreferrer"
        >
          Download full report (PDF) →
        </a>
      )}
    </article>
  )
}
