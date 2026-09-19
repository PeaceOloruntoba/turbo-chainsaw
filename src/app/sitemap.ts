import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const STATIC_ROUTES = [
  '',
  '/about',
  '/research',
  '/firms',
  '/intelligence',
  '/pilot-2026',
  '/events',
  '/subscribe',
  '/contact',
  '/legal/privacy-policy',
  '/legal/cookie-policy',
  '/legal/terms-of-use',
  '/legal/disclaimer',
  '/legal/editorial-independence',
  '/legal/corrections-policy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }))

  try {
    const payload = await getPayloadClient()

    const [firms, articles] = await Promise.all([
      payload.find({
        collection: 'firms',
        where: { researchStatus: { equals: 'published' } },
        limit: 500,
        depth: 0,
        overrideAccess: false,
      }),
      payload.find({
        collection: 'intelligence',
        // overrideAccess: false => only published, non-future-dated items.
        // Members-only items are included too: their title/summary are public
        // (the body is gated), so the pages are legitimately indexable.
        limit: 500,
        depth: 0,
        overrideAccess: false,
      }),
    ])

    const firmEntries: MetadataRoute.Sitemap = firms.docs.map((firm: any) => ({
      url: `${siteUrl}/firms/${firm.slug}`,
      lastModified: firm.updatedAt ? new Date(firm.updatedAt) : new Date(),
    }))

    const articleEntries: MetadataRoute.Sitemap = articles.docs.map((article: any) => ({
      url: `${siteUrl}/intelligence/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(),
    }))

    return [...staticEntries, ...firmEntries, ...articleEntries]
  } catch {
    // Database unavailable at build time — ship the static routes only
    // rather than failing the whole sitemap.
    return staticEntries
  }
}
