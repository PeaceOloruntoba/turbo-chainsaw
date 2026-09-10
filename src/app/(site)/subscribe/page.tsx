import type { Metadata } from 'next'
import { SubscribeForm } from '@/components/SubscribeForm'

export const metadata: Metadata = {
  title: 'Subscribe',
  description:
    'Receive Nigeria Lex research, market intelligence, reports and invitations to briefings and roundtables.',
  alternates: { canonical: '/subscribe' },
}

export default function SubscribePage() {
  return (
    <div className="container max-w-xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
        Nigeria Lex Briefing
      </p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
        Receive Nigeria Lex research and intelligence.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">
        Receive Nigeria Lex research, market intelligence, reports and invitations to briefings
        and roundtables.
      </p>
      <div className="mt-10">
        <SubscribeForm />
      </div>
    </div>
  )
}
