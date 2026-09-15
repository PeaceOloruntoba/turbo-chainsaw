"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Homepage hero photo gallery. Swipes/scrolls one photo per "page" (native
 * CSS scroll-snap — works with touch swipe, trackpad, and the arrow
 * buttons), replacing the single static photo. All images are Unsplash
 * License (free for commercial use, no attribution required) — deliberately
 * not showing an on-page photo-credit line.
 */
const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1719314073622-9399d167725b?q=80&w=1200&auto=format&fit=crop",
    alt: "The Lekki-Ikoyi Link Bridge, Lagos — Nigeria's commercial and legal centre.",
  },
  {
    src: "https://images.unsplash.com/photo-1594538756542-8c88bda491c5?q=80&w=1200&auto=format&fit=crop",
    alt: "Aerial view of Lagos, Nigeria.",
  },
  {
    src: "https://images.unsplash.com/photo-1550969026-f069940eedae?q=80&w=1200&auto=format&fit=crop",
    alt: "A bridge over water in Lagos, Nigeria.",
  },
];

export function HomeHeroGallery({ className }: { className?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, SLIDES.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setActive(clamped);
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-sm border border-paper/15 shadow-2xl shadow-black/40">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SLIDES.map((slide) => (
            <div
              key={slide.src}
              className="relative aspect-[5/6] w-full flex-none snap-start"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => scrollToIndex(active - 1)}
          disabled={active === 0}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-navy/70 p-2 text-paper backdrop-blur-sm transition-opacity hover:bg-navy disabled:pointer-events-none disabled:opacity-0 sm:block"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => scrollToIndex(active + 1)}
          disabled={active === SLIDES.length - 1}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-navy/70 p-2 text-paper backdrop-blur-sm transition-opacity hover:bg-navy disabled:pointer-events-none disabled:opacity-0 sm:block"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        className="mt-3 flex justify-center gap-1.5"
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
              index === active
                ? "w-6 bg-green"
                : "w-1.5 bg-paper/30 hover:bg-paper/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
