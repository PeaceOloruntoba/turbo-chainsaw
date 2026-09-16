import type { Metadata } from 'next'
import Link from 'next/link'
import { ResearchSubmissionForm } from '@/components/ResearchSubmissionForm'
import { SubscribeForm } from '@/components/SubscribeForm'
import { PageIntro } from '@/components/PageIntro'
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
    "The Nigeria Lex Pilot Study 2026 will test and refine our research methodology while developing an independent evidence base on selected areas of Nigeria's corporate legal market. The pilot is intended to provide investors, businesses, financial institutions, professional advisers and other institutional users with clearer insight into legal capability, experience and market conditions."
  const whatIsBeingResearched =
    content?.whatIsBeingResearched ||
    "A selected range of practice areas within Nigeria's corporate legal market, chosen for their significance to institutional users of legal services. Practice areas under research will be confirmed as the pilot progresses and published on the Firms & Lawyers section as they become available."
  const methodologyNote =
    content?.methodologyNote ||
    'The pilot follows the Nigeria Lex research process: research, verification, analysis, editorial review and publication.'
  const whyItMatters =
    content?.whyItMatters ||
    "Reliable, independently researched information about legal capability in Nigeria is difficult to obtain. The pilot's findings are intended to help investors, businesses, financial institutions and professional advisers make more informed decisions when engaging Nigerian legal counsel."
  const whoCanParticipate =
    content?.whoCanParticipate ||
    'Nigerian law firms and practitioners are invited to participate in the underlying research. Investors, corporates, financial institutions, professional advisers and other institutional users of Nigerian legal services are separately invited to contribute market feedback and insight.'
  const timeline = content?.timeline?.length ? content.timeline : FALLBACK_TIMELINE
  const lagosPresentationNote =
    content?.lagosPresentationNote ||
    'Nigeria Lex proposes to present initial pilot findings in Lagos in the week commencing 16 November 2026. The date and venue remain proposed and subject to confirmation as research progresses.'
  const howToEngageIntro =
    content?.howToEngageIntro ||
    'Law firms, institutional users and other market participants can engage with the Pilot Study 2026 as set out below.'

  return (
    <>
      <PageIntro
        eyebrow="Pilot 2026"
        title="Nigeria Lex Pilot Study 2026"
        description="Testing and refining an independent research methodology for Nigeria's corporate legal market."
        tone="pilot"
      />
      <div className="container max-w-3xl py-16 md:py-20">
        <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">{intro}</p>

        {/* Distinct calls to action, immediately below the introduction, for
            each of the two participation routes plus general pilot updates. */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="#law-firms-participate"
            className="rounded-sm bg-green px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep"
          >
            Law Firms — Participate in Research
          </Link>
          <Link
            href="#institutional-contribute"
            className="rounded-sm border border-navy px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-navy transition-colors hover:bg-navy hover:text-paper"
          >
            Institutional Users — Contribute
          </Link>
          <Link
            href="#register-updates"
            className="rounded-sm border border-line px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-navy transition-colors hover:border-navy"
          >
            Register for Pilot Updates
          </Link>
        </div>

        <section className="mt-14 border-t border-line pt-10">
          <h2 className="font-serif text-lg text-navy">What Is Being Researched</h2>
          <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate">
            {whatIsBeingResearched}{' '}
            <Link href="/research#methodology" className="text-green">
              See our methodology
            </Link>
            . {methodologyNote}
          </p>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-lg text-navy">Why It Matters</h2>
          <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate">{whyItMatters}</p>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-lg text-navy">Who Can Participate</h2>
          <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate">{whoCanParticipate}</p>
        </section>

        <section className="mt-12 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Timetable</h2>
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

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-lg text-navy">Proposed Lagos Presentation</h2>
          <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate">
            {lagosPresentationNote}
          </p>
        </section>
      </div>

      <section className="border-t border-line bg-mist">
        <div className="container max-w-3xl py-14">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">How to Engage</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate">{howToEngageIntro}</p>
        </div>
      </section>

      <section id="law-firms-participate" className="scroll-mt-24 border-t border-line bg-white">
        <div className="container grid gap-12 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h2 className="font-serif text-2xl text-navy">Law Firms &mdash; Participate in Research</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-slate">
              Submit information for consideration as part of the Pilot Study 2026.
            </p>
            <div className="mt-6">
              <ResearchSubmissionForm defaultType="law_firm" />
            </div>
          </div>
          <div id="institutional-contribute" className="scroll-mt-24">
            <h2 className="font-serif text-2xl text-navy">Institutional Users &mdash; Contribute</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-slate">
              Share market evidence or feedback to inform Nigeria Lex research.
            </p>
            <div className="mt-6">
              <ResearchSubmissionForm defaultType="other_institutional" />
            </div>
          </div>
        </div>
      </section>

      <section id="register-updates" className="scroll-mt-24 border-t border-line bg-paper">
        <div className="container max-w-xl py-16 md:py-20">
          <h2 className="font-serif text-2xl text-navy">Register for Pilot Updates</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-slate">
            Receive Nigeria Lex Pilot Study 2026 updates, including the proposed Lagos
            presentation and launch details.
          </p>
          <div className="mt-6">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  )
}
