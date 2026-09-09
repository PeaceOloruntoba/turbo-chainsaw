import type { Metadata } from 'next'
import { IndependenceBanner } from '@/components/IndependenceBanner'
import { ResearchSubmissionForm } from '@/components/ResearchSubmissionForm'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Research',
  description:
    'How Nigeria Lex researches Nigerian corporate law firms and practitioners: our methodology, criteria, process and how to participate.',
  alternates: { canonical: '/research' },
}

const FALLBACK_HOW_WE_RESEARCH = [
  'Submissions from participating law firms',
  'Significant and representative transactions',
  'Publicly available transaction and regulatory information',
  'Independent market research',
  'Interviews with practitioners',
  'Consultation with clients and users of legal services',
  'Sector and practice-area analysis',
  'Peer and market feedback',
  'Verification of submitted information where practicable',
].map((item) => ({ item }))

const FALLBACK_CRITERIA = [
  { label: 'Experience', detail: 'The nature, complexity and significance of work undertaken.' },
  { label: 'Expertise', detail: 'Demonstrated specialist capability within a practice area or sector.' },
  { label: 'Practitioners', detail: 'Depth and quality of relevant practitioner experience.' },
  { label: 'Clients and Markets', detail: 'Experience advising sophisticated domestic and international clients.' },
  { label: 'Transactions', detail: 'Participation in significant or representative transactions and mandates.' },
  { label: 'Sector Knowledge', detail: 'Evidence of sustained expertise within relevant industries.' },
  {
    label: 'Cross-Border Capability',
    detail: 'Experience involving international clients, counterparties, advisers and transactions.',
  },
  { label: 'Market Evidence', detail: 'Information obtained through independent consultation and research.' },
]

const FALLBACK_PROCESS = [
  { step: 'Research', detail: 'Gathering evidence on firms, practitioners, transactions and sector activity.' },
  { step: 'Verification', detail: 'Checking findings against independent sources and market evidence.' },
  { step: 'Analysis', detail: 'Assessing capability, experience and market standing against our criteria.' },
  { step: 'Editorial Review', detail: 'Independent editorial scrutiny before any material is published.' },
  { step: 'Publication', detail: 'Findings are published on Nigeria Lex, subject to ongoing correction and review.' },
]

async function getResearchContent() {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({ slug: 'research-content' })
  } catch {
    return null
  }
}

export default async function ResearchPage() {
  const content = await getResearchContent()

  const tagline = content?.tagline || 'Evidence before reputation'
  const methodologyText =
    content?.methodologyText ||
    "Nigeria Lex seeks to provide an independent assessment of Nigeria's corporate legal market based upon research rather than reputation alone. Our research considers evidence of demonstrated capability, significant work, practitioner expertise, market experience and other relevant indicators."
  const howWeResearch = content?.howWeResearch?.length ? content.howWeResearch : FALLBACK_HOW_WE_RESEARCH
  const noSingleFactorText = content?.noSingleFactorText || 'No single factor determines a Nigeria Lex assessment.'
  const criteria = content?.criteria?.length ? content.criteria : FALLBACK_CRITERIA
  const process = content?.process?.length ? content.process : FALLBACK_PROCESS
  const researchIndependenceText =
    content?.researchIndependenceText ||
    "Participation in Nigeria Lex research is free. A firm's decision whether to advertise, sponsor an event, subscribe to Nigeria Lex Intelligence or enter into another commercial relationship with Nigeria Lex has no bearing upon its assessment, inclusion or recognition."
  const correctionsText =
    content?.correctionsText ||
    'Nigeria Lex seeks accuracy and fairness. Firms and practitioners may bring factual inaccuracies to our attention. Requests for correction will be considered where supported by appropriate evidence. A request for review does not guarantee alteration of an editorial assessment.'
  const participateIntro =
    content?.participateIntro ||
    'Law firms and institutional users can submit information for consideration as part of Nigeria Lex research using the secure form below.'

  return (
    <>
      <div className="container max-w-3xl py-16 md:py-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
          Research
        </p>
        <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">Our Research</h1>
        <p className="mt-3 font-serif text-lg italic text-slate">{tagline}</p>

        <section id="methodology" className="mt-10 scroll-mt-24">
          <h2 className="font-serif text-xl text-navy">Our Methodology</h2>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">
            {methodologyText}
          </p>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">How We Research</h2>
          <p className="mt-4 text-[15px] text-navy-ink">Research may include:</p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {howWeResearch.map((entry: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-[15px] text-navy-ink">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-green" />
                {entry.item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[14px] italic text-slate">{noSingleFactorText}</p>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">What We Assess</h2>
          <p className="mt-4 text-[15px] text-navy-ink">
            Depending upon the relevant practice area, our research may consider:
          </p>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {criteria.map((criterion: any, i: number) => (
              <div key={i}>
                <dt className="text-[15px] font-medium text-navy">{criterion.label}</dt>
                <dd className="mt-1 text-[14px] leading-relaxed text-slate">{criterion.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Research Process</h2>
          <ol className="mt-6 space-y-6">
            {process.map((item: any, index: number) => (
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
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">
            {researchIndependenceText}
          </p>
        </section>

        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Corrections and Review</h2>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">
            {correctionsText}
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
          <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">{participateIntro}</p>
          <div className="mt-8">
            <ResearchSubmissionForm defaultType="law_firm" />
          </div>
        </div>
      </section>
    </>
  )
}
