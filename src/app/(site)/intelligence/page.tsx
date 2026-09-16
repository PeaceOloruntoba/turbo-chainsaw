import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { PageIntro } from '@/components/PageIntro'

export const metadata: Metadata = {
  title: 'Intelligence',
  description:
    "Nigeria Lex Intelligence: independent, research-led analysis of developments affecting Nigeria's corporate legal and investment environment.",
  alternates: { canonical: '/intelligence' },
}

// Retained so the filter bar keeps its intended shape once Nigeria Lex
// Intelligence starts publishing — see point 3 of the site brief: filters
// stay visible, but must not surface placeholder/dummy content while the
// pilot is under way.
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

const EARLIER_PUBLICATIONS = [
  {
    title: 'Legal Guide to Investing in Nigeria',
    year: '2018',
    publisher: 'Nigerians in the Square Mile (NISM)',
    description:
      "A multi-contributor guide bringing together Nigerian legal expertise to provide investors and businesses with practical insight into Nigeria's legal and regulatory environment.",
    href: '/research/nism-legal-guide-to-investing-in-nigeria-2018.pdf',
    cta: 'View the 2018 Legal Guide',
  },
  {
    title: 'Nigeria Investment Survey 2015 — London Responds',
    year: '2015',
    publisher: 'Nigerians in the Square Mile (NISM)',
    description:
      'An empirical study examining the experiences and perceptions of London-based investors and transaction advisers operating in the Nigerian market.',
    href: '/research/nism-nigeria-investment-survey-2015-london-responds.pdf',
    cta: 'View the 2015 Investment Survey',
  },
]

export default async function IntelligencePage({ searchParams }: Args) {
  const { category } = await searchParams
  const items = await getIntelligence(category)

  return (
    <>
      <PageIntro
        eyebrow="Nigeria Lex Intelligence"
        title="Independent insight into Nigeria's corporate legal market."
        description="Research-led analysis of developments affecting Nigeria's corporate legal and investment environment."
        tone="intelligence"
      />

      <div className="container max-w-4xl py-16 md:py-20">
        {/* Category filters are retained for continuity once publishing
            begins, but stay visually inert (no live counts / active
            states driven by dummy content) while Nigeria Lex Intelligence
            has nothing published yet. */}
        <div className="flex flex-wrap gap-2">
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
          <div className="mt-10 rounded-sm border border-line bg-white p-8 md:p-12">
            <p className="eyebrow">Nigeria Lex Intelligence</p>
            <h2 className="mt-3 max-w-xl font-serif text-2xl text-navy md:text-3xl">
              Independent insight into Nigeria&rsquo;s corporate legal market.
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-navy-ink">
              Nigeria Lex Intelligence will provide research-led analysis of developments affecting
              Nigeria&rsquo;s corporate legal and investment environment. Our intelligence will include
              market briefings, sector analysis, transaction intelligence, regulatory developments and
              investor-focused insights, drawing on Nigeria Lex research and wider market intelligence.
            </p>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-navy-ink">
              We are currently conducting the Nigeria Lex Pilot Study 2026. Our first substantive
              intelligence and research outputs will be published as the pilot programme progresses.
            </p>

            <div className="mt-8 border-t border-line pt-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-green">
                Stay informed
              </p>
              <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-slate">
                Register to receive Nigeria Lex research, intelligence and Pilot Study updates.
              </p>
              <Link
                href="/subscribe"
                className="mt-5 inline-block rounded-sm bg-green px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep"
              >
                Subscribe for Updates
              </Link>
            </div>
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

        {/* Earlier Research & Publications — pre-Nigeria Lex archive. */}
        <section className="mt-16 border-t border-line pt-12">
          <p className="eyebrow">Archive</p>
          <h2 className="mt-2 font-serif text-2xl text-navy md:text-3xl">
            Earlier Research &amp; Publications
          </h2>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate">
            Nigeria Lex was established in 2026. The publications below pre-date Nigeria Lex and are
            included because of their relevance to the development of research, legal-market
            understanding and informed investment decision-making in Nigeria. They remain publications
            of their original publisher and should be read in the context of the law, market conditions
            and information available at the time of publication.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {EARLIER_PUBLICATIONS.map((pub) => (
              <div key={pub.href} className="flex flex-col rounded-sm border border-line bg-white p-7">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate">
                  {pub.publisher} &middot; {pub.year}
                </p>
                <h3 className="mt-2 font-serif text-lg text-navy">{pub.title}</h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-navy-ink">
                  {pub.description}
                </p>

                <p className="mt-6 border-t border-line pt-4 text-[12px] italic leading-relaxed text-slate">
                  Archive Notice: These publications are provided for historical and research purposes.
                  They have not been updated and should not be relied upon as statements of current law,
                  regulation or market conditions.
                </p>

                <a
                  href={pub.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block self-start rounded-sm border border-navy px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-navy transition-colors hover:bg-navy hover:text-paper"
                >
                  {pub.cta}
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
