import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { PageIntro } from '@/components/PageIntro'

export const metadata: Metadata = {
  title: 'Firms & Lawyers',
  description:
    'Independent, evidence-led research profiles of Nigerian corporate law firms and practitioners.',
  alternates: { canonical: '/firms' },
}

const FILTERS = ['Firm', 'Lawyer', 'Practice Area', 'Sector', 'Location']

async function getPublishedFirms() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'firms',
      where: { researchStatus: { equals: 'published' } },
      limit: 100,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
}

export default async function FirmsPage() {
  const firms = await getPublishedFirms()

  return (
    <>
      <PageIntro
        eyebrow="Firms & Lawyers"
        title="Evidence-led research on Nigeria's corporate law firms and practitioners."
        description="A structured view of capability, experience, sectors and practice areas."
        tone="firms"
      />
      <div className="container max-w-4xl py-16 md:py-20">

      {/* Filter architecture: disabled during the pilot, wired up once published
          research volume justifies filtering. Kept visible so the structure of
          the eventual database is clear to visitors. */}
      <div className="mt-10 flex flex-wrap gap-3" aria-disabled="true">
        {FILTERS.map((filter) => (
          <span
            key={filter}
            className="rounded-sm border border-line px-4 py-2 text-[13px] text-slate"
          >
            {filter}
          </span>
        ))}
      </div>

      {firms.length === 0 ? (
        <div className="mt-10 rounded-sm border border-line bg-white p-8">
          <p className="font-serif text-lg text-navy">
            Research in progress &mdash; Nigeria Lex Pilot Study 2026
          </p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate">
            This section is being built into a structured, searchable database of firms and
            lawyers, filterable by firm, lawyer, practice area, sector and location. Profiles will
            be published here as Nigeria Lex research is completed, verified and editorially
            reviewed.
          </p>
          <Link
            href="/pilot-2026"
            className="mt-6 inline-block text-[13px] font-semibold text-green"
          >
            Read about the Pilot Study 2026 →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          {firms.map((firm: any) => (
            <li key={firm.id} className="bg-white p-6">
              <Link href={`/firms/${firm.slug}`} className="font-serif text-lg text-navy">
                {firm.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </>
  )
}
