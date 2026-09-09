import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'

type Args = { params: Promise<{ slug: string }> }

async function getFirm(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'firms',
    where: { slug: { equals: slug }, researchStatus: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

async function getLawyersForFirm(firmId: string | number) {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'lawyers',
      where: { firm: { equals: firmId } },
      limit: 50,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Args) {
  const { slug } = await params
  const firm = await getFirm(slug)
  return { title: firm ? firm.name : 'Firm not found' }
}

export default async function FirmProfilePage({ params }: Args) {
  const { slug } = await params
  const firm = await getFirm(slug)
  if (!firm) notFound()

  const lawyers = await getLawyersForFirm(firm.id)

  return (
    <div className="container max-w-3xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
        Firm Research Profile
      </p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">{firm.name}</h1>

      {firm.overview && (
        <section className="prose prose-sm mt-10 max-w-none">
          <RichText data={firm.overview} />
        </section>
      )}

      {firm.coreCapabilities?.length > 0 && (
        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Core Capabilities</h2>
          <ul className="mt-4 space-y-2">
            {firm.coreCapabilities.map((item: any, i: number) => (
              <li key={i} className="text-[15px] text-navy-ink">
                {item.capability}
              </li>
            ))}
          </ul>
        </section>
      )}

      {firm.representativeExperience?.length > 0 && (
        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Representative Experience</h2>
          <ul className="mt-4 space-y-3">
            {firm.representativeExperience.map((item: any, i: number) => (
              <li key={i} className="text-[15px] leading-relaxed text-navy-ink">
                {item.description}
                {item.year ? <span className="text-slate"> ({item.year})</span> : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {lawyers.length > 0 && (
        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Key Practitioners</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {lawyers.map((lawyer: any) => (
              <li key={lawyer.id}>
                {/* Individual lawyer profile pages aren't built yet (see
                    README — Firms & Lawyers directory is Phase 3), so this
                    is plain text rather than a link for now. */}
                <p className="text-[15px] font-medium text-navy">{lawyer.name}</p>
                {lawyer.title && <p className="text-[13px] text-slate">{lawyer.title}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {firm.sectorStrengths?.length > 0 && (
        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Sector Strengths</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {firm.sectorStrengths.map((item: any, i: number) => (
              <li
                key={i}
                className="rounded-sm border border-line px-3 py-1.5 text-[13px] text-navy-ink"
              >
                {item.sector}
              </li>
            ))}
          </ul>
        </section>
      )}

      {firm.crossBorderExperience && (
        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Cross-Border Experience</h2>
          <div className="prose prose-sm mt-4 max-w-none">
            <RichText data={firm.crossBorderExperience} />
          </div>
        </section>
      )}

      {firm.nigeriaLexAnalysis && (
        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-navy">Nigeria Lex Analysis</h2>
          <div className="prose prose-sm mt-4 max-w-none">
            <RichText data={firm.nigeriaLexAnalysis} />
          </div>
        </section>
      )}
    </div>
  )
}
