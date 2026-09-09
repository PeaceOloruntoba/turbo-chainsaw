import Link from 'next/link'
import type { Metadata } from 'next'
import { Search, TrendingUp, Building2, Landmark, FileText, type LucideIcon } from 'lucide-react'
import { IndependenceBanner } from '@/components/IndependenceBanner'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const PILLAR_ICONS: Record<string, LucideIcon> = {
  'Legal Market Research': Search,
  'Market Intelligence': TrendingUp,
  'Firms & Lawyers': Building2,
  'Institutional Intelligence': Landmark,
  'Reports & Insights': FileText,
}

const FALLBACK_PILLARS = [
  {
    title: 'Legal Market Research',
    description: 'Independent research into Nigerian corporate law firms, practitioners and areas of expertise.',
    href: '/research',
  },
  {
    title: 'Market Intelligence',
    description:
      'Analysis of transactions, sectors, regulatory developments and trends affecting demand for legal services.',
    href: '/intelligence',
  },
  {
    title: 'Firms & Lawyers',
    description: 'Evidence-led profiles and recognition of firms and practitioners demonstrating significant capability.',
    href: '/firms',
  },
  {
    title: 'Institutional Intelligence',
    description:
      'Research designed to assist investors, financial institutions, corporates, international law firms and other organisations operating in or engaging with Nigeria.',
    href: '/intelligence',
  },
  {
    title: 'Reports & Insights',
    description: "Regular analysis of developments affecting Nigeria's corporate legal and investment environment.",
    href: '/intelligence',
  },
]

async function getHomeContent() {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({ slug: 'home-content' })
  } catch {
    return null
  }
}

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
    return []
  }
}

export default async function HomePage() {
  const [content, latest] = await Promise.all([getHomeContent(), getLatestIntelligence()])

  const heroHeadline = content?.heroHeadline || 'Independent research. Market intelligence. Informed choice.'
  const heroBody =
    content?.heroBody ||
    "Nigeria Lex is an independent, research-led legal market intelligence platform providing credible insight into the capabilities, experience and expertise of Nigeria's corporate law firms and practitioners."
  const ctaPrimaryLabel = content?.ctaPrimaryLabel || 'Explore Our Research'
  const ctaPrimaryHref = content?.ctaPrimaryHref || '/research'
  const ctaSecondaryLabel = content?.ctaSecondaryLabel || 'About Nigeria Lex'
  const ctaSecondaryHref = content?.ctaSecondaryHref || '/about'
  const pillars = content?.pillars?.length ? content.pillars : FALLBACK_PILLARS
  const pilotTeaserLabel = content?.pilotTeaserLabel || 'Nigeria Lex Pilot Study 2026'
  const pilotTeaserHeadline =
    content?.pilotTeaserHeadline ||
    'Our inaugural pilot study is testing and refining the Nigeria Lex methodology.'

  return (
    <>
      <section className="bg-navy text-paper">
        <div className="container py-24 md:py-32">
          <h1 className="max-w-3xl font-serif text-[2.75rem] leading-[1.05] tracking-[-0.01em] md:text-[4.25rem]">
            {heroHeadline}
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-paper/70">{heroBody}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={ctaPrimaryHref}
              className="rounded-sm bg-green px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep"
            >
              {ctaPrimaryLabel}
            </Link>
            <Link
              href={ctaSecondaryHref}
              className="rounded-sm border border-paper/25 px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:border-paper"
            >
              {ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <IndependenceBanner />

      <section className="bg-mist py-24 md:py-32">
        <div className="container">
          <h2 className="max-w-md font-serif text-3xl text-navy md:text-4xl">What We Do</h2>
          <div className="mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar: any) => {
              const Icon = PILLAR_ICONS[pillar.title] || FileText
              return (
                <Link key={pillar.title} href={pillar.href} className="group block">
                  <Icon size={28} strokeWidth={1.5} className="text-green" />
                  <h3 className="mt-5 font-serif text-xl text-navy">{pillar.title}</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate">{pillar.description}</p>
                  <span className="mt-4 inline-block text-[13px] font-semibold text-navy underline decoration-line underline-offset-4 group-hover:text-green group-hover:decoration-green">
                    Learn more
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="bg-white py-24 md:py-32">
          <div className="container">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-3xl text-navy">Latest Intelligence</h2>
              <Link href="/intelligence" className="text-[13px] font-semibold text-green">
                View all
              </Link>
            </div>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {latest.map((item: any) => (
                <Link key={item.id} href={`/intelligence/${item.slug}`} className="group block">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
                    {item.category}
                  </p>
                  <h3 className="mt-3 font-serif text-xl text-navy group-hover:text-green">{item.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-slate">{item.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-mist py-20">
        <div className="container flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
              {pilotTeaserLabel}
            </p>
            <h2 className="mt-2 max-w-xl font-serif text-2xl text-navy">{pilotTeaserHeadline}</h2>
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
