import Link from "next/link";
import { getPayloadClient } from "@/lib/payload";
import { MobileNav } from "./MobileNav";

const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Research", href: "/research" },
  { label: "Firms & Lawyers", href: "/firms" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Pilot 2026", href: "/pilot-2026" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

async function getSiteSettings() {
  try {
    const payload = await getPayloadClient();
    return await payload.findGlobal({ slug: "site-settings" });
  } catch {
    return null;
  }
}

export async function Header() {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "Nigeria Lex";
  const logoUrl = (settings?.logo as any)?.url as string | undefined;
  // Member portal is OFF until switched on in Site Settings → Member portal.
  const portalEnabled = Boolean((settings as any)?.memberPortal?.enabled);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="container flex h-[76px] items-center justify-between gap-3 sm:gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          {logoUrl ? (
            // Admin-uploaded logo: rendered as a single image since we can't
            // know its internal composition (may already be a full lockup).
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-10 w-auto sm:h-12" />
          ) : (
            // Default lockup: the NL monogram image plus a real text
            // wordmark set alongside it, rather than baked into a single
            // image. This lets the "NIGERIA LEX" wordmark be sized for
            // legibility independently of the monogram / header height.
            // The text is deliberately allowed to shrink+truncate (rather
            // than force whitespace-nowrap at every breakpoint) so the
            // lockup never pushes the sticky header — and with it, the
            // whole page — wider than the viewport on narrow phones.
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-lockup.png"
                alt=""
                aria-hidden="true"
                className="h-9 w-auto shrink-0 sm:h-10"
              />
              <span className="min-w-0 truncate font-serif text-[12px] font-semibold uppercase tracking-[0.08em] text-navy sm:text-[15px] sm:tracking-[0.14em]">
                {siteName}
              </span>
            </>
          )}
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[13px] font-medium tracking-[0.04em] text-navy-ink">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="uppercase transition-colors hover:text-green"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {portalEnabled && (
            <Link
              href="/account"
              className="hidden whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.06em] text-navy-ink transition-colors hover:text-green lg:inline-block"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/subscribe"
            className="hidden whitespace-nowrap rounded-sm bg-green px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep lg:inline-block"
          >
            Subscribe
          </Link>
          <MobileNav portalEnabled={portalEnabled} />
        </div>
        </div>
      </header>
      <div aria-hidden="true" className="h-[76px]" />
    </>
  );
}
