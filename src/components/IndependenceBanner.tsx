import { getPayloadClient } from '@/lib/payload'

async function getStatement() {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    return settings?.independenceStatement
  } catch {
    return null
  }
}

export async function IndependenceBanner() {
  const statement =
    (await getStatement()) ||
    'Nigeria Lex does not charge law firms or practitioners for consideration, inclusion or recognition in its research. Sponsorship, subscriptions and other commercial relationships do not determine research outcomes.'

  return (
    <section className="border-y border-line bg-white">
      <div className="container flex flex-col gap-3 py-8 md:flex-row md:items-start md:gap-8">
        <p className="shrink-0 font-serif text-base text-navy">Our Independence</p>
        <p className="max-w-2xl text-[15px] leading-relaxed text-slate">{statement}</p>
      </div>
    </section>
  )
}
