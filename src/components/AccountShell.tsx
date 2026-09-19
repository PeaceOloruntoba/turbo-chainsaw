import type { ReactNode } from 'react'

/** Shared page frame for the member-portal pages (sign in, register, etc.). */
export function AccountShell({
  eyebrow = 'Nigeria Lex Members',
  title,
  intro,
  children,
}: {
  eyebrow?: string
  title: string
  intro?: string
  children?: ReactNode
}) {
  return (
    <div className="container max-w-xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">{title}</h1>
      {intro && <p className="mt-4 text-[15px] leading-relaxed text-navy-ink">{intro}</p>}
      <div className="mt-10">{children}</div>
    </div>
  )
}
