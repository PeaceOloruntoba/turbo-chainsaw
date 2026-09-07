import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Nigeria Lex is an independent, research-led legal market intelligence platform. Learn about our purpose, leadership, ownership and research partnership.',
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

  const whoWeAre =
    content?.whoWeAre ||
    "Nigeria Lex is an independent, research-led legal market intelligence platform established to improve the quality, accessibility and international visibility of information about Nigeria's corporate legal market."
  const purpose =
    content?.purpose ||
    "Institutional users of Nigerian legal services often make decisions about Nigerian legal counsel without access to independent, evidence-led information. Nigeria Lex exists to close that information gap."
  const leadershipName = content?.leadership?.name || 'Paul Onifade'
  const leadershipTitle = content?.leadership?.title || 'Founder & Editor-in-Chief'
  const leadershipBio =
    content?.leadership?.biography ||
    'A full professional biography for Paul Onifade will be published here shortly.'
  const ownershipText =
    content?.ownershipText || 'Nigeria Lex is an initiative of Kaye & Crowther Limited.'
  const researchPartnerText =
    content?.researchPartnerText ||
    "SBM Intelligence acts as Nigeria Lex's Strategic Research & Intelligence Partner, contributing research and data expertise to the Nigeria Lex methodology."

  return (
    <div className="container max-w-3xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">About</p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
        An independent voice on Nigeria&rsquo;s legal market.
      </h1>

      <section className="mt-12">
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
  )
}
