import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'About', href: '/about' },
  { label: 'Research', href: '/research' },
  { label: 'Firms & Lawyers', href: '/firms' },
  { label: 'Intelligence', href: '/intelligence' },
  { label: 'Pilot 2026', href: '/pilot-2026' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif text-[22px] tracking-tight text-navy">
            Nigeria Lex<span className="align-super text-[10px]">™</span>
          </span>
          <span className="mt-1 hidden text-[11px] tracking-[0.08em] text-slate sm:block">
            Legal Market Intelligence for Informed Decisions
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[13px] font-medium tracking-[0.04em] text-navy-ink">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="uppercase transition-colors hover:text-green">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/subscribe"
          className="whitespace-nowrap rounded-sm bg-green px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep"
        >
          Subscribe
        </Link>
      </div>

      {/* Mobile nav: simple wrapped list, no JS menu required for Phase 1 */}
      <nav aria-label="Primary mobile" className="border-t border-line lg:hidden">
        <ul className="container flex flex-wrap gap-x-5 gap-y-2 py-3 text-[12px] font-medium uppercase tracking-[0.04em] text-navy-ink">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-green">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
