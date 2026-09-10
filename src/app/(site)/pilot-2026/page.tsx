import type { Metadata } from 'next'
import Link from 'next/link'
import { ResearchSubmissionForm } from '@/components/ResearchSubmissionForm'
import { SubscribeForm } from '@/components/SubscribeForm'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Pilot 2026',
  description:
    'The Nigeria Lex Pilot Study 2026 tests and refines the Nigeria Lex research methodology through engagement with law firms, practitioners, investors and institutional users.',
  alternates: { canonical: '/pilot-2026' },
}

const FALLBACK_TIMELINE = [
  { label: 'Research & engagement', detail: 'Firm and practitioner research, verification and market engagement.' },
  { label: 'Analysis & editorial review', detail: 'Independent analysis and editorial review of pilot findings.' },
  { label: 'Lagos presentation', detail: 'Proposed presentation and launch: Lagos, week commencing 16 November 2026 (subject to research progress).' },
]

async function getPilotContent() {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({ slug: 'pilot-2026-content' })
  } catch {
    return null
  }
}

export default async function Pilot2026Page() {
  const content = await getPilotContent()

  const intro =
    content?.intro ||
    "Nigeria Lex is undertaking an inaugural pilot study examining selected areas of Nigeria's corporate legal market. The pilot will test and refine the Nigeria Lex research methodology through engagement with law firms, practitioners, investors and institutional users."
  const objectives =
    content?.objectives ||
    "To test and refine Nigeria Lex's research methodology ahead of full-scale research, and to establish the platform's initial evidence base."
  const researchScope =
    content?.researchScope ||
    "A selected range of practice areas within Nigeria's corporate legal market, chosen for their significance to institutional users of legal services."
  const methodologyNote =
    content?.methodologyNote ||
    'The pilot follows the Nigeria Lex research process: research, verification, analysis, editorial review and publication.'
  const practiceAreasNote =
    content?.practiceAreasNote ||
    'To be confirmed as pilot research progresses and will be published on the Firms & Lawyers section as it becomes available.'
  const timeline = content?.timeline?.length ? content.timeline : FALLBACK_TIMELINE

  return (
    <>
      <div className="container max-w-3xl py-16 md:py-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
          Pilot 2026
        </p>
        <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
          Nigeria Lex Pilot Study 2026
        </h1>
        <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">{intro}</p>

        <section className="mt-12 grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-lg text-navy">Objectives</h2>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate">{objectives}</p>
          </div>
          <div>
            <h2 className="font-serif text-lg text-navy">Research Scope</h2>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate">{researchScope}</p>
          </div>
          <div>
            <h2 className="font-serif text-lg text-navy">Methodology</h2>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate">
              {methodologyNote}{' '}
              <Link href="/research" className="text-green">
                See our methodology
              </Link>
              .
            </p>
          </div>
          <div>
            <h2 className="font-serif text-lg text-navy">Participating Practice Areas</h2>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate">{practiceAreasNote}</p>
          </div>
        </section>

        <section className="mt-12 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Research Timetable</h2>
          <ol className="mt-6 space-y-6">
            {timeline.map((item: any, index: number) => (
              <li key={item.label} className="flex gap-5">
                <span className="font-serif text-lg text-line">{index + 1}</span>
                <div>
                  <p className="text-[15px] font-medium text-navy">{item.label}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section id="participate" className="scroll-mt-24 border-t border-line bg-white">
        <div className="container grid gap-12 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h2 className="font-serif text-2xl text-navy">Law Firms &mdash; Participate</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-slate">
              Submit information for consideration as part of the Pilot Study 2026.
            </p>
            <div className="mt-6">
              <ResearchSubmissionForm defaultType="law_firm" />
            </div>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-navy">Institutional Users &mdash; Contribute</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-slate">
              Share market evidence or feedback to inform Nigeria Lex research.
            </p>
            <div className="mt-6">
              <ResearchSubmissionForm defaultType="institutional" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="container max-w-xl py-16 md:py-20">
          <h2 className="font-serif text-2xl text-navy">Register for Pilot Updates</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-slate">
            Receive Nigeria Lex Pilot Study 2026 updates, including the Lagos presentation and
            launch details.
          </p>
          <div className="mt-6">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  )
}
