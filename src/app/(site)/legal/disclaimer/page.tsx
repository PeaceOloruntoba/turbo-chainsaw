import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer',
}

export default function Page() {
  return (
    <div className="container max-w-2xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">Legal</p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">Disclaimer</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-navy-ink">
        This Disclaimer is being finalised with Nigeria Lex&rsquo;s legal counsel and will be
        published here shortly. For questions in the meantime, contact
        {' '}<a href="mailto:info@nigerialex.com" className="text-green">info@nigerialex.com</a>.
      </p>
    </div>
  )
}
