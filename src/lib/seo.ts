export const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
export const siteName = 'Nigeria Lex'

/** Builds an absolute URL from a site-relative path (for canonical/OG/JSON-LD). */
export function absoluteUrl(path: string) {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/** Truncates copy for meta descriptions / OG descriptions at a word boundary. */
export function truncate(text: string | null | undefined, max = 160) {
  if (!text) return undefined
  if (text.length <= max) return text
  const clipped = text.slice(0, max - 1)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : max - 1)}…`
}
