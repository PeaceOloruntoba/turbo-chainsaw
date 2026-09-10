import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/seo'

const VALID_SLUGS = [
  'privacy-policy',
  'cookie-policy',
  'terms-of-use',
  'disclaimer',
  'editorial-independence',
  'corrections-policy',
]

type Args = { params: Promise<{ slug: string }> }

async function getLegalPage(slug: string) {
  if (!VALID_SLUGS.includes(slug)) return null
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'legal-pages',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const page = await getLegalPage(slug)
  const isUnreviewed = !page || page.reviewStatus === 'draft_placeholder'

  return {
    title: page?.title || 'Legal',
    description: page?.title ? `${page.title} — Nigeria Lex.` : 'Nigeria Lex legal information.',
    alternates: { canonical: absoluteUrl(`/legal/${slug}`) },
    // Unreviewed placeholder text shouldn't be indexed until legal counsel
    // has signed off on it — see the in-page draft notice below.
    robots: isUnreviewed ? { index: false, follow: true } : { index: true, follow: true },
  }
}

export default async function LegalPage({ params }: Args) {
  const { slug } = await params
  if (!VALID_SLUGS.includes(slug)) notFound()

  const page = await getLegalPage(slug)

  return (
    <div className="container max-w-2xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">Legal</p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
        {page?.title || 'This page is being finalised'}
      </h1>

      {(!page || page.reviewStatus === 'draft_placeholder') && (
        <div className="mt-6 rounded-sm border border-line bg-white px-5 py-4 text-[13px] leading-relaxed text-slate">
          <strong className="text-navy">Draft — pending legal review.</strong> The text below is
          placeholder content for development and design purposes. It has not been reviewed by
          Nigeria Lex&rsquo;s legal counsel and must not be relied upon until finalised.
        </div>
      )}

      {page ? (
        <div className="prose prose-sm mt-8 max-w-none">
          <RichText data={page.body} />
        </div>
      ) : (
        <p className="mt-8 text-[15px] leading-relaxed text-navy-ink">
          This page has not yet been published. For questions in the meantime, contact{' '}
          <a href="mailto:info@nigerialex.com" className="text-green">
            info@nigerialex.com
          </a>
          .
        </p>
      )}
    </div>
  )
}
