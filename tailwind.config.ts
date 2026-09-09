import type { Config } from 'tailwindcss'

/**
 * NIGERIA LEX — Design tokens
 *
 * Palette
 *   navy        #0A192F   Deep navy — headers, hero fields, primary text on light
 *   navy-ink    #0F1B2D   Body copy ink (slightly softer than pure navy for long-form reading)
 *   green       #005A36   Institutional green — links, active states, primary CTA
 *   green-deep  #003D25   Hover/pressed state for green
 *   paper       #F8FAFC   Off-white background
 *   line        #D9E0E8   Hairline rule / border colour
 *   slate       #55647A   Secondary / muted text
 *
 * Type
 *   Display / headings — "Source Serif 4" (editorial, research-institution register)
 *   Body / UI          — "IBM Plex Sans" (clean, international, legible at small sizes)
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '2rem', lg: '2.5rem' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1180px' },
    },
    extend: {
      colors: {
        navy: '#0A192F',
        'navy-ink': '#0F1B2D',
        green: {
          DEFAULT: '#005A36',
          deep: '#003D25',
        },
        paper: '#F8FAFC',
        mist: '#EEF2F6',
        'navy-tint': '#E7ECF3',
        line: '#D9E0E8',
        slate: '#55647A',
      },
      fontFamily: {
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-plex-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            maxWidth: '68ch',
            color: '#0F1B2D',
            a: { color: '#005A36' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
