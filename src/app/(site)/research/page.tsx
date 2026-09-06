import type { Metadata } from 'next'
import { IndependenceBanner } from '@/components/IndependenceBanner'
import { ResearchSubmissionForm } from '@/components/ResearchSubmissionForm'

export const metadata: Metadata = {
  title: 'Research',
  description:
    'How Nigeria Lex researches Nigerian corporate law firms and practitioners: our methodology, criteria, process and how to participate.',
}

const CRITERIA = [
  'Experience',
  'Expertise',
  'Significant transactions',
  'Practitioner capability',
  'Sector knowledge',
  'Cross-border experience',
  'Market evidence',
  'Client / market feedback',
]

const PROCESS = [
  { step: 'Research', detail: 'Gathering evidence on firms, practitioners, transactions and sector activity.' },
  { step: 'Verification', detail: 'Checking findings against independent sources and market evidence.' },
  { step: 'Analysis', detail: 'Assessing capability, experience and market standing against our criteria.' },
  { step: 'Editorial Review', detail: 'Independent editorial scrutiny before any material is published.' },
  { step: 'Publication', detail: 'Findings are published on Nigeria Lex, subject to ongoing correction and review.' },
]

export default function ResearchPage() {
  return (
    <>
      <div className="container max-w-3xl py-16 md:py-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
          Research
        </p>
        <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
          How Nigeria Lex researches firms and practitioners.
        </h1>

        <section id="methodology" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-xl text-navy">Our Methodology</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">
            Nigeria Lex research is evidence-led. We assess firms and practitioners against a
            consistent set of criteria, verify our findings independently, and subject every
            conclusion to editorial review before publication.
          </p>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Research Criteria</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {CRITERIA.map((criterion) => (
              <li key={criterion} className="flex items-start gap-2 text-[15px] text-navy-ink">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-green" />
                {criterion}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Research Process</h2>
          <ol className="mt-6 space-y-6">
            {PROCESS.map((item, index) => (
              <li key={item.step} className="flex gap-5">
                <span className="font-serif text-lg text-line">{index + 1}</span>
                <div>
                  <p className="text-[15px] font-medium text-navy">{item.step}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Research Independence</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">
            Participation and recognition in Nigeria Lex research are not conditional upon
            payment.
          </p>
        </section>
      </div>

      <IndependenceBanner />

      <section id="participate" className="scroll-mt-24 border-t border-line bg-white">
        <div className="container max-w-2xl py-16 md:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
            Participate in Research
          </p>
          <h2 className="mt-2 font-serif text-2xl text-navy">
            Submission guidelines and secure electronic submission.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">
            Law firms and institutional users can submit information for consideration as part of
            Nigeria Lex research using the secure form below. Research deadlines and downloadable
            submission forms will be published here ahead of each research cycle.
          </p>
          <div className="mt-8">
            <ResearchSubmissionForm defaultType="law_firm" />
          </div>
        </div>
      </section>
    </>
  )
}
