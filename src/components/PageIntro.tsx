import Image from 'next/image'

const IMAGE_BY_TONE = {
  about: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1400&auto=format&fit=crop',
  research: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=1400&auto=format&fit=crop',
  intelligence: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop',
  firms: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1400&auto=format&fit=crop',
  pilot: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1400&auto=format&fit=crop',
  events: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1400&auto=format&fit=crop',
  contact: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1400&auto=format&fit=crop',
} as const

type PageIntroProps = {
  eyebrow: string
  title: string
  description?: string
  tone: keyof typeof IMAGE_BY_TONE
}

export function PageIntro({ eyebrow, title, description, tone }: PageIntroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-paper">
      <Image src={IMAGE_BY_TONE[tone]} alt="" fill sizes="100vw" className="z-0 object-cover opacity-75" priority />
      <div className="absolute inset-0 z-10 bg-navy/45" />
      <div className="container relative z-20 grid min-h-[290px] items-end gap-4 py-12 md:min-h-[350px] md:grid-cols-[1fr_0.65fr] md:py-16">
        <div>
          <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-green-200">
            <span className="h-px w-9 bg-green" />
            {eyebrow}
          </p>
          <h1 className="text-balance text-white max-w-3xl font-serif text-4xl leading-[1.02] md:text-6xl">{title}</h1>
        </div>
        {description && <p className="max-w-md border-l border-paper/35 pl-5 text-[15px] leading-relaxed text-paper/75">{description}</p>}
      </div>
    </section>
  )
}
