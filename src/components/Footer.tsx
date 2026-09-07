import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

const LEGAL_SLUGS = [
  'privacy-policy',
  'cookie-policy',
  'terms-of-use',
  'disclaimer',
  'editorial-independence',
  'corrections-policy',
] as const

const FALLBACK_LEGAL_TITLES: Record<string, string> = {
  'privacy-policy': 'Privacy Policy',
  'cookie-policy': 'Cookie Policy',
  'terms-of-use': 'Terms of Use',
  disclaimer: 'Disclaimer',
  'editorial-independence': 'Editorial Independence',
  'corrections-policy': 'Corrections Policy',
}

async function getFooterData() {
  try {
    const payload = await getPayloadClient()
    const [settings, legalPages] = await Promise.all([
      payload.findGlobal({ slug: 'site-settings' }),
      payload.find({ collection: 'legal-pages', limit: 20, depth: 0 }),
    ])
    return { settings, legalPages: legalPages.docs }
  } catch {
    return { settings: null, legalPages: [] as any[] }
  }
}

export async function Footer() {
  const { settings, legalPages } = await getFooterData()

  const siteName = settings?.siteName || 'Nigeria Lex'
  const strapline = settings?.strapline || 'Legal Market Intelligence for Informed Decisions'
  const lagos = settings?.correspondence?.lagos || 'Lagos, Nigeria'
  const emails = settings?.departmentalEmails?.length
    ? settings.departmentalEmails
    : [{ label: 'General', email: 'info@nigerialex.com' }]
  const generalEmail = emails.find((e: any) => e.label === 'General')?.email || emails[0]?.email
  const copyrightTemplate =
    settings?.footerCopyright ||
    '© {year} Kaye & Crowther Limited. All rights reserved. Nigeria Lex™ is a trade mark of Kaye & Crowther Limited.'
  const copyright = copyrightTemplate.replace('{year}', String(new Date().getFullYear()))

  const legalLinks = LEGAL_SLUGS.map((slug) => {
    const doc = legalPages.find((p: any) => p.slug === slug)
    return { slug, title: doc?.title || FALLBACK_LEGAL_TITLES[slug] }
  })

  return (
    <footer className="border-t border-line bg-navy text-paper">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-serif text-lg">
            {siteName}
            <span className="align-super text-[10px]">™</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/70">{strapline}</p>
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-paper/60">
            Correspondence
          </p>
          <ul className="mt-3 space-y-1 text-sm text-paper/80">
            <li className="whitespace-pre-line">{lagos}</li>
            {generalEmail && (
              <li className="pt-2">
                <a href={`mailto:${generalEmail}`} className="hover:text-white">
                  {generalEmail}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-paper/60">
            Legal
          </p>
          <ul className="mt-3 space-y-1 text-sm text-paper/80">
            {legalLinks.map((link) => (
              <li key={link.slug}>
                <Link href={`/legal/${link.slug}`} className="hover:text-white">
                  {link.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/research#methodology" className="hover:text-white">
                Research Methodology
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container py-5 text-[12px] leading-relaxed text-paper/60">{copyright}</p>
      </div>
    </footer>
  )
}
