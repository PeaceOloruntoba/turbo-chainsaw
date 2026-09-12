'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'About', href: '/about' },
  { label: 'Research', href: '/research' },
  { label: 'Firms & Lawyers', href: '/firms' },
  { label: 'Intelligence', href: '/intelligence' },
  { label: 'Pilot 2026', href: '/pilot-2026' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the menu automatically on navigation.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent background scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center text-navy"
      >
        <Menu size={24} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-navy/95 text-paper backdrop-blur-md">
          <div className="container flex h-[76px] items-center justify-between">
            <span className="font-serif text-lg">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center"
            >
              <X size={24} strokeWidth={1.75} />
            </button>
          </div>
          <nav aria-label="Primary mobile" className="container mt-6">
            <ul className="flex flex-col divide-y divide-white/10 border-t border-white/10">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-4 font-serif text-2xl text-paper transition-colors hover:text-green"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/subscribe"
              className="mt-8 block w-full rounded-sm bg-green px-6 py-3.5 text-center text-[13px] font-semibold uppercase tracking-[0.06em] text-paper"
            >
              Subscribe
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
