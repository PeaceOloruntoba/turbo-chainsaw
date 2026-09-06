import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Nigeria Lex is an independent, research-led legal market intelligence platform. Learn about our purpose, leadership, ownership and research partnership.',
}

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">About</p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
        An independent voice on Nigeria&rsquo;s legal market.
      </h1>

      <section className="mt-12">
        <h2 className="font-serif text-xl text-navy">Who We Are</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">
          Nigeria Lex is an independent, research-led legal market intelligence platform
          established to improve the quality, accessibility and international visibility of
          information about Nigeria&rsquo;s corporate legal market.
        </p>
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <h2 className="font-serif text-xl text-navy">Our Purpose</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">
          Institutional users of Nigerian legal services &mdash; investors, financial
          institutions, development finance institutions, multinational corporations and
          international law firms among them &mdash; often make decisions about Nigerian legal
          counsel without access to independent, evidence-led information. Nigeria Lex exists to
          close that information gap: combining legal-market knowledge, rigorous research and
          market intelligence so that institutional users can make better-informed decisions
          about who they instruct and why.
        </p>
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <h2 className="font-serif text-xl text-navy">Leadership</h2>
        <div className="mt-4 flex flex-col gap-1">
          <p className="text-[15px] font-medium text-navy">Paul Onifade</p>
          <p className="text-[13px] text-slate">Founder &amp; Editor-in-Chief</p>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-navy-ink">
          A full professional biography for Paul Onifade will be published here shortly.
        </p>
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <h2 className="font-serif text-xl text-navy">Ownership</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">
          Nigeria Lex is an initiative of Kaye &amp; Crowther Limited.
        </p>
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <h2 className="font-serif text-xl text-navy">Research Partner</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">
          SBM Intelligence acts as Nigeria Lex&rsquo;s Strategic Research &amp; Intelligence
          Partner, contributing research and data expertise to the Nigeria Lex methodology. A
          fuller description of this partnership will be published following execution of the
          collaboration agreement.
        </p>
      </section>
    </div>
  )
}
