'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Full-bleed homepage hero background: a swipeable set of Lagos photos
 * (industrial/infrastructure character — bridges, port, aerial skyline; no
 * gavels/handshakes/staged imagery, consistent with the rest of the site),
 * with the site's grid-line pattern and a navy tint layered on top so the
 * hero text stays legible.
 *
 * Renders as the first children of the hero <section> in page.tsx — meant
 * to sit behind that section's normal-flow text content (which should be
 * `relative z-10`). Swiping is native CSS scroll-snap (touch swipe /
 * trackpad drag); left/right arrows and dot indicators are layered on top
 * for mouse users.
 *
 * All photos are Unsplash License (free for commercial use, no attribution
 * required) — deliberately no on-page photo-credit line.
 */
const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1765475467677-579353b25ce0?q=80&w=1600&auto=format&fit=crop',
    alt: 'Boats on the water beside a modern bridge, Lagos, Nigeria.',
  },
  {
    src: 'https://images.unsplash.com/photo-1569706971306-de5d78f6418e?q=80&w=1600&auto=format&fit=crop',
    alt: 'Aerial view of Lagos, Nigeria.',
  },
  {
    src: 'https://images.unsplash.com/photo-1719314073622-9399d167725b?q=80&w=1600&auto=format&fit=crop',
    alt: 'The Lekki-Ikoyi Link Bridge, Lagos, Nigeria.',
  },
  {
    src: 'https://images.unsplash.com/photo-1721907758701-d118fdd56b50?q=80&w=1600&auto=format&fit=crop',
    alt: 'A bridge over water in Lagos, Nigeria, in black and white.',
  },
]

export function HomeHeroGallery() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  function scrollToIndex(index: number) {
    const el = scrollerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(index, SLIDES.length - 1))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
    setActive(clamped)
  }

  function handleScroll() {
    const el = scrollerRef.current
    if (!el || el.clientWidth === 0) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <>
      {/* Photo track — the only layer that actually scrolls. */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide, index) => (
          <div key={slide.src} className="relative h-full w-full flex-none snap-start">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Grid pattern + navy tint, layered above the photos so hero text
          stays legible. pointer-events-none so swipe/drag still reaches the
          photo track beneath. */}
      <div className="hero-grid-overlay pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-navy/60" />

      {/* Prev/next controls */}
      <button
        type="button"
        aria-label="Previous photo"
        onClick={() => scrollToIndex(active - 1)}
        disabled={active === 0}
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-navy/70 p-2.5 text-paper backdrop-blur-sm transition-opacity hover:bg-navy disabled:pointer-events-none disabled:opacity-0 sm:block"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        onClick={() => scrollToIndex(active + 1)}
        disabled={active === SLIDES.length - 1}
        className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-navy/70 p-2.5 text-paper backdrop-blur-sm transition-opacity hover:bg-navy disabled:pointer-events-none disabled:opacity-0 sm:block"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div
        className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-1.5 md:bottom-6"
        role="tablist"
        aria-label="Choose photo"
      >
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Photo ${index + 1} of ${SLIDES.length}`}
            onClick={() => scrollToIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === active ? 'w-6 bg-green' : 'w-1.5 bg-paper/40 hover:bg-paper/60'
            }`}
          />
        ))}
      </div>
    </>
  )
}
