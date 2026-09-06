import Link from 'next/link'
import { IndependenceBanner } from '@/components/IndependenceBanner'
import { getPayloadClient } from '@/lib/payload'

const PILLARS = [
  {
    title: 'Legal Market Research',
    description: 'Independent research and analysis of Nigeria\u2019s corporate legal market.',
    href: '/research',
  },
  {
    title: 'Firms & Lawyers',
    description: 'Evidence-led information about firms, practitioners and areas of expertise.',
    href: '/firms',
  },
  {
    title: 'Market Intelligence',
    description:
      'Analysis of transactions, sectors and developments affecting Nigeria\u2019s legal and investment environment.',
    href: '/intelligence',
  },
  {
    title: 'Reports & Briefings',
    description: 'Research and intelligence designed for institutional decision-makers.',
    href: '/intelligence',
  },
]

async function getLatestIntelligence() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'intelligence',
      limit: 3,
      sort: '-publishedAt',
      depth: 0,
    })
    return result.docs
  } catch {
    // Database not yet provisioned / no content published — homepage still renders.
    return []
  }
}

export default async function HomePage() {
  const latest = await getLatestIntelligence()

  return (
    <>
      <section className="bg-navy text-paper">
        <div className="container grid gap-10 py-20 md:grid-cols-[1.4fr_1fr] md:py-28">
          <div>
            <h1 className="max-w-xl font-serif text-[2.5rem] leading-[1.1] md:text-[3.25rem]">
              Independent intelligence on Nigeria&rsquo;s corporate legal market.
            </h1>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-paper/75">
              Nigeria Lex provides independent research and intelligence on the capabilities,
              experience and expertise of Nigeria&rsquo;s corporate law firms and practitioners.
              We combine legal-market knowledge, evidence-led research and market intelligence to
              help investors, businesses, financial institutions and professional advisers make
              informed decisions about Nigeria&rsquo;s legal market.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/research"
                className="rounded-sm bg-green px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep"
              >
                Explore Our Research
              </Link>
              <Link
                href="/research#methodology"
                className="rounded-sm border border-paper/30 px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:border-paper"
              >
                Our Methodology
              </Link>
            </div>
          </div>
        </div>
      </section>

      <IndependenceBanner />

      <section className="container py-16 md:py-20">
        <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-4">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group flex flex-col gap-3 bg-white p-7 transition-colors hover:bg-paper"
            >
              <h2 className="font-serif text-lg text-navy">{pillar.title}</h2>
              <p className="text-[14px] leading-relaxed text-slate">{pillar.description}</p>
              <span className="mt-auto pt-2 text-[13px] font-semibold text-green group-hover:text-green-deep">
                Learn more
              </span>
            </Link>
          ))}
        </div>
      </section>

      {latest.length > 0 && (
        <section className="border-t border-line bg-white py-16 md:py-20">
          <div className="container">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-2xl text-navy">Latest Intelligence</h2>
              <Link href="/intelligence" className="text-[13px] font-semibold text-green">
                View all
              </Link>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {latest.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/intelligence/${item.slug}`}
                  className="block border-t border-line pt-4"
                >
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
                    {item.category}
                  </p>
                  <h3 className="mt-2 font-serif text-lg text-navy">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate">{item.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-paper py-16 md:py-20">
        <div className="container flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
              Nigeria Lex Pilot Study 2026
            </p>
            <h2 className="mt-2 max-w-xl font-serif text-2xl text-navy">
              Our inaugural pilot study is testing and refining the Nigeria Lex methodology.
            </h2>
          </div>
          <Link
            href="/pilot-2026"
            className="whitespace-nowrap rounded-sm border border-navy px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-navy transition-colors hover:bg-navy hover:text-paper"
          >
            About the Pilot
          </Link>
        </div>
      </section>
    </>
  )
}
