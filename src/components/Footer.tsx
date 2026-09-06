import Link from 'next/link'

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/legal/privacy-policy' },
  { label: 'Cookie Policy', href: '/legal/cookie-policy' },
  { label: 'Terms of Use', href: '/legal/terms-of-use' },
  { label: 'Disclaimer', href: '/legal/disclaimer' },
  { label: 'Research Methodology', href: '/research#methodology' },
  { label: 'Editorial Independence', href: '/legal/editorial-independence' },
  { label: 'Corrections Policy', href: '/legal/corrections-policy' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="border-t border-line bg-navy text-paper">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-serif text-lg">
            Nigeria Lex<span className="align-super text-[10px]">™</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/70">
            Legal Market Intelligence for Informed Decisions. An independent, research-led
            platform focused on Nigeria&rsquo;s corporate legal market.
          </p>
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-paper/60">
            Correspondence
          </p>
          <ul className="mt-3 space-y-1 text-sm text-paper/80">
            <li>Lagos, Nigeria</li>
            <li>London, United Kingdom</li>
            <li className="pt-2">
              <a href="mailto:info@nigerialex.com" className="hover:text-white">
                info@nigerialex.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-paper/60">
            Legal
          </p>
          <ul className="mt-3 space-y-1 text-sm text-paper/80">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container py-5 text-[12px] leading-relaxed text-paper/60">
          © {new Date().getFullYear()} Kaye &amp; Crowther Limited. All rights reserved. Nigeria
          Lex™ is a trade mark of Kaye &amp; Crowther Limited.
        </p>
      </div>
    </footer>
  )
}
