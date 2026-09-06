import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Nigeria Lex — research, editorial, partnerships, events and general enquiries.',
}

const DEPARTMENTS = [
  { label: 'Research', email: 'research@nigerialex.com' },
  { label: 'Editorial', email: 'editorial@nigerialex.com' },
  { label: 'Partnerships & Institutional Enquiries', email: 'partnerships@nigerialex.com' },
  { label: 'Events', email: 'events@nigerialex.com' },
  { label: 'General', email: 'info@nigerialex.com' },
]

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">Contact</p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">Get in touch.</h1>

      <section className="mt-12">
        <h2 className="font-serif text-lg text-navy">Departments</h2>
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {DEPARTMENTS.map((dept) => (
            <li key={dept.email} className="flex items-center justify-between py-3">
              <span className="text-[15px] text-navy-ink">{dept.label}</span>
              <a href={`mailto:${dept.email}`} className="text-[14px] font-medium text-green">
                {dept.email}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-line pt-10">
        <h2 className="font-serif text-lg text-navy">Correspondence</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-slate">
              Lagos
            </p>
            <p className="mt-1 text-[15px] text-navy-ink">
              Nigeria Lex correspondence address to be confirmed.
            </p>
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-slate">
              London
            </p>
            <p className="mt-1 text-[15px] text-navy-ink">
              International presence — address to be confirmed.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
