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
    "Nigeria has one of Africa's largest and most sophisticated legal markets. Nigeria Lex was established to address the information gap facing organisations entering the market."
  const purpose =
    content?.purpose ||
    'Our purpose is not simply to identify prominent names. We seek to understand where demonstrable capability exists.'
  const leadershipName = content?.leadership?.name || 'Paul Onifade'
  const leadershipTitle = content?.leadership?.title || 'Founder & Editor-in-Chief'
  const leadershipBio =
    content?.leadership?.biography ||
    'A full professional biography for Paul Onifade will be published here shortly.'
  const ownershipText =
    content?.ownershipText || 'Nigeria Lex is promoted and published by Kaye & Crowther Limited.'
  const researchPartnerText =
    content?.researchPartnerText ||
    "SBM Intelligence acts as Nigeria Lex's Strategic Research & Intelligence Partner."

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
        <h2 className="font-serif text-xl text-navy">Research Partner</h2>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy-ink">
          {researchPartnerText}
        </p>
      </section>
      </div>
    </>
  )
}
