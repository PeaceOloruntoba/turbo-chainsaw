import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Intelligence',
  description:
    'Nigeria Lex Intelligence: articles, market analysis, reports, sector briefings, transaction intelligence, regulatory intelligence and investor briefings.',
  alternates: { canonical: '/intelligence' },
}

const CATEGORIES = [
  'Article',
  'Report',
  'Briefing',
  'Sector Briefing',
  'Transaction Intelligence',
  'Regulatory Intelligence',
  'Investor Briefing',
]

async function getIntelligence(category?: string) {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'intelligence',
      where: category ? { category: { equals: category } } : {},
      sort: '-publishedAt',
      limit: 50,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
}

type Args = { searchParams: Promise<{ category?: string }> }

export default async function IntelligencePage({ searchParams }: Args) {
  const { category } = await searchParams
  const items = await getIntelligence(category)

  return (
    <div className="container max-w-4xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
        Nigeria Lex Intelligence
      </p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
        Analysis, reports and briefings for institutional decision-makers.
      </h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/intelligence"
          className={`rounded-sm border px-3.5 py-1.5 text-[13px] ${
            !category ? 'border-green text-green' : 'border-line text-slate'
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/intelligence?category=${encodeURIComponent(cat)}`}
            className={`rounded-sm border px-3.5 py-1.5 text-[13px] ${
              category === cat ? 'border-green text-green' : 'border-line text-slate'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-sm border border-line bg-white p-8">
          <p className="font-serif text-lg text-navy">No items published yet.</p>
          <p className="mt-2 text-[14px] text-slate">
            Nigeria Lex Intelligence will appear here as research, analysis and briefings are
            published. Check back soon, or{' '}
            <Link href="/subscribe" className="text-green">
              subscribe
            </Link>{' '}
            to be notified.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line border-t border-line">
          {items.map((item: any) => (
            <li key={item.id} className="py-6">
              <Link href={`/intelligence/${item.slug}`} className="group">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
                  {item.category}
                  {item.isSubscriberOnly && (
                    <span className="ml-2 rounded-sm bg-navy px-2 py-0.5 text-[10px] tracking-normal text-paper">
                      Subscriber Only
                    </span>
                  )}
                </p>
                <h2 className="mt-2 font-serif text-xl text-navy group-hover:text-green">
                  {item.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate">
                  {item.summary}
                </p>
                {item.publishedAt && (
                  <p className="mt-3 text-[12px] text-slate">
                    {new Date(item.publishedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
