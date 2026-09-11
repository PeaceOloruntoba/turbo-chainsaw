import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Search, TrendingUp, Building2, Landmark, FileText, ArrowRight, Activity, type LucideIcon } from 'lucide-react'
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
      <section className="hero-grid relative overflow-hidden text-paper">
        <div className="absolute right-0 top-0 hidden h-full w-[34%] border-l border-paper/10 bg-green/10 lg:block" />
        <div className="container relative grid gap-12 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-green-200">
              <span className="h-px w-10 bg-green" />
              Nigeria Lex / 2026
            </div>
            <h1 className="text-balance max-w-2xl font-serif text-[2.75rem] leading-[0.98] tracking-[-0.01em] md:text-[4.5rem]">
              {heroHeadline}
            </h1>
            <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-paper/70 md:text-[17px]">{heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={ctaPrimaryHref}
                className="group inline-flex items-center gap-2 rounded-sm bg-green px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep"
              >
                {ctaPrimaryLabel}
                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href={ctaSecondaryHref}
                className="rounded-sm border border-paper/25 px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:border-paper"
              >
                {ctaSecondaryLabel}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="absolute -right-3 -top-5 z-10 hidden w-36 border border-paper/20 bg-navy/80 p-4 backdrop-blur-sm sm:block">
              <Activity size={17} className="mb-6 text-green" />
              <p className="text-[10px] uppercase tracking-[0.12em] text-paper/50">Signal / 01</p>
              <p className="mt-1 font-serif text-lg">Evidence first</p>
            </div>
            <div
              aria-hidden="true"
              className="absolute -left-4 top-8 hidden h-[calc(100%-4rem)] w-[3px] bg-green md:block"
            />
            <div className="relative aspect-[5/6] overflow-hidden rounded-sm border border-paper/15 shadow-2xl shadow-black/40 md:ml-5">
              <Image
                src="https://images.unsplash.com/photo-1618828665347-d870c38c95c7?q=80&w=1200&auto=format&fit=crop"
                alt="Skyline of Lekki, Lagos — the commercial and legal centre of Nigeria's corporate market"
                fill
                priority
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-paper/45 md:ml-5">
              Lekki, Lagos — Nigeria&rsquo;s commercial and legal centre. Photo: Nupo Deyon Daniel / Unsplash.
            </p>
          </div>
        </div>
      </section>

      <IndependenceBanner />

      <section className="site-grid bg-mist py-20 md:py-28">
        <div className="container">
          <div className="flex items-end justify-between gap-6 border-b border-line pb-6">
            <div>
              <p className="eyebrow">Our point of view</p>
              <h2 className="mt-2 max-w-md font-serif text-3xl text-navy md:text-4xl">What We Do</h2>
            </div>
            <span className="hidden font-serif text-5xl text-navy/10 md:block">01—05</span>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar: any) => {
              const Icon = PILLAR_ICONS[pillar.title] || FileText
              return (
                <Link
                  key={pillar.title}
                  href={pillar.href}
                  className="group block rounded-sm border border-line bg-white/90 p-7 transition-all hover:-translate-y-1 hover:border-green/40 hover:shadow-[0_16px_32px_-18px_rgba(10,25,47,0.45)]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist text-green">
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
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
        <section className="bg-white py-20 md:py-28">
          <div className="container">
            <div className="flex items-end justify-between border-b border-line pb-6">
              <div>
                <p className="eyebrow">From the desk</p>
                <h2 className="mt-2 font-serif text-3xl text-navy">Latest Intelligence</h2>
              </div>
              <Link href="/intelligence" className="text-[13px] font-semibold text-green">
                View all
              </Link>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
              {latest.map((item: any) => (
                <Link key={item.id} href={`/intelligence/${item.slug}`} className="group block bg-white p-7 transition-colors hover:bg-mist">
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
