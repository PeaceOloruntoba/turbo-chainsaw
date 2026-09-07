import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Nigeria Lex — research, editorial, partnerships, events and general enquiries.',
}

const FALLBACK_DEPARTMENTS = [
  { label: 'Research', email: 'research@nigerialex.com' },
  { label: 'Editorial', email: 'editorial@nigerialex.com' },
  { label: 'Partnerships & Institutional Enquiries', email: 'partnerships@nigerialex.com' },
  { label: 'Events', email: 'events@nigerialex.com' },
  { label: 'General', email: 'info@nigerialex.com' },
]

async function getContactData() {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({ slug: 'site-settings' })
  } catch {
    return null
  }
}

export default async function ContactPage() {
  const settings = await getContactData()

  const departments = settings?.departmentalEmails?.length
    ? settings.departmentalEmails
    : FALLBACK_DEPARTMENTS
  const lagos = settings?.correspondence?.lagos || 'Nigeria Lex correspondence address to be confirmed.'
  const london = settings?.correspondence?.london || 'International presence — address to be confirmed.'

  return (
    <div className="container max-w-2xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">Contact</p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">Get in touch.</h1>

      <section className="mt-12">
        <h2 className="font-serif text-lg text-navy">Departments</h2>
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {departments.map((dept: any) => (
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
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-slate">Lagos</p>
            <p className="mt-1 whitespace-pre-line text-[15px] text-navy-ink">{lagos}</p>
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-slate">London</p>
            <p className="mt-1 whitespace-pre-line text-[15px] text-navy-ink">{london}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
