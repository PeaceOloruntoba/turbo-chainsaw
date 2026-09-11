import Image from 'next/image'

const IMAGE_BY_TONE = {
  about: 'https://images.unsplash.com/photo-1575320181282-9afab399332c?q=80&w=1400&auto=format&fit=crop',
  research: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1400&auto=format&fit=crop',
  intelligence: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop',
  firms: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1400&auto=format&fit=crop',
} as const

type PageIntroProps = {
  eyebrow: string
  title: string
  description?: string
  tone: keyof typeof IMAGE_BY_TONE
}

export function PageIntro({ eyebrow, title, description, tone }: PageIntroProps) {
  return (
    <section className="hero-grid relative overflow-hidden text-paper">
      <div className="absolute inset-0 bg-navy/45" />
      <div className="container relative grid min-h-[290px] items-end gap-4 py-12 md:min-h-[350px] md:grid-cols-[1fr_0.65fr] md:py-16">
        <div>
          <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-green-200">
            <span className="h-px w-9 bg-green" />
            {eyebrow}
          </p>
          <h1 className="text-balance max-w-3xl font-serif text-4xl leading-[1.02] md:text-6xl">{title}</h1>
        </div>
        {description && <p className="max-w-md border-l border-paper/35 pl-5 text-[15px] leading-relaxed text-paper/75">{description}</p>}
      </div>
      <Image src={IMAGE_BY_TONE[tone]} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-55 mix-blend-luminosity" priority />
    </section>
  )
}
