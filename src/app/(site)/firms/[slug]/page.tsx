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

export async function generateMetadata({ params }: Args) {
  const { slug } = await params
  const firm = await getFirm(slug)
  return { title: firm ? firm.name : 'Firm not found' }
}

export default async function FirmProfilePage({ params }: Args) {
  const { slug } = await params
  const firm = await getFirm(slug)
  if (!firm) notFound()

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
