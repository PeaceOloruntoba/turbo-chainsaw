import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { MobileNav } from './MobileNav'

const NAV_ITEMS = [
  { label: 'About', href: '/about' },
  { label: 'Research', href: '/research' },
  { label: 'Firms & Lawyers', href: '/firms' },
  { label: 'Intelligence', href: '/intelligence' },
  { label: 'Pilot 2026', href: '/pilot-2026' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]

async function getSiteSettings() {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({ slug: 'site-settings' })
  } catch {
    return null
  }
}

export async function Header() {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'Nigeria Lex'
  const logoUrl = (settings?.logo as any)?.url as string | undefined

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            // Admin-uploaded logo: rendered as a single image since we can't
            // know its internal composition (may already be a full lockup).
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-12 w-auto" />
          ) : (
            // Default lockup: the NL monogram image plus a real text
            // wordmark set alongside it, rather than baked into a single
            // image. This lets the "NIGERIA LEX" wordmark be sized for
            // legibility independently of the monogram / header height.
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="" aria-hidden="true" className="h-10 w-auto shrink-0" />
              <span className="whitespace-nowrap font-serif text-[15px] font-semibold uppercase tracking-[0.14em] text-navy">
                {siteName}
              </span>
            </>
          )}
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[13px] font-medium tracking-[0.04em] text-navy-ink">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="uppercase transition-colors hover:text-green">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/subscribe"
            className="hidden whitespace-nowrap rounded-sm bg-green px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep lg:inline-block"
          >
            Subscribe
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
