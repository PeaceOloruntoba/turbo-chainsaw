import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { PageIntro } from '@/components/PageIntro'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Nigeria Lex is an independent, research-led legal market intelligence platform. Learn about our purpose, leadership, ownership and research partnership.',
  alternates: { canonical: '/about' },
}

async function getAboutContent() {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({ slug: 'about-content' })
  } catch {
    return null
  }
}

export default async function AboutPage() {
  const content = await getAboutContent()

  const tagline = content?.tagline || "Better information about Nigeria's legal market"
  const whoWeAre =
    content?.whoWeAre ||
    "Nigeria Lex provides independent research and market intelligence on Nigeria's corporate legal market, helping investors, businesses, financial institutions and professional advisers make informed decisions about legal capability and market conditions.\n\nNigeria has one of Africa's largest and most sophisticated legal markets. Nigeria Lex was established to address the information gap facing organisations entering the market."
  const purpose =
    content?.purpose ||
    'Our purpose is not simply to identify prominent names. We seek to understand where demonstrable capability exists.'
  const leadershipName = content?.leadership?.name || 'Paul Onifade'
  const leadershipTitle = content?.leadership?.title || 'Founder & Editor-in-Chief'
  const leadershipBio =
    content?.leadership?.biography ||
    "Paul Onifade is a Solicitor Advocate of the Senior Courts of England and Wales and Founder & Editor-in-Chief of Nigeria Lex. He leads the platform's editorial vision, legal-market strategy and institutional development."
  const ownershipText =
    content?.ownershipText || 'Nigeria Lex is owned and published by Kaye & Crowther Limited.'
  const researchPartnerText =
    content?.researchPartnerText ||
    'SBM Intelligence supports Nigeria Lex in research design, data verification, analysis and market intelligence. SBM Intelligence is an Africa-focused research and strategic intelligence firm with expertise across the socio-political, economic, security and business environments in West Africa.'

  return (
    <>
      <PageIntro eyebrow="About Nigeria Lex" title="About Nigeria Lex" description={tagline} tone="about" />
      <div className="container max-w-3xl py-16 md:py-20">

      <section className="mt-10">
        <h2 className="font-serif text-xl text-navy">Who We Are</h2>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">{whoWeAre}</p>
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <h2 className="font-serif text-xl text-navy">Our Purpose</h2>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">{purpose}</p>
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <h2 className="font-serif text-xl text-navy">Leadership</h2>
        <div className="mt-4 flex flex-col gap-1">
          <p className="text-[15px] font-medium text-navy">{leadershipName}</p>
          <p className="text-[13px] text-slate">{leadershipTitle}</p>
        </div>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">{leadershipBio}</p>
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <h2 className="font-serif text-xl text-navy">Ownership</h2>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">{ownershipText}</p>
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <h2 className="font-serif text-xl text-navy">Strategic Research &amp; Intelligence Partner</h2>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">
          {researchPartnerText}
        </p>
      </section>
      </div>
    </>
  )
}
