import { headers as nextHeaders } from 'next/headers'
import { getPayloadClient } from './payload'

/**
 * Returns the currently signed-in account (a staff user OR a member), or null
 * for an anonymous visitor.
 *
 * NOTE: reading request headers makes the calling page dynamic (rendered per
 * request rather than statically cached). Only call this from pages that
 * genuinely need per-viewer content (gated articles, firm profiles, /account).
 * The returned object carries `collection` ('users' | 'members'), which the
 * helpers in `@/access` rely on.
 */
export async function getViewer() {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await nextHeaders() })
    return user ?? null
  } catch {
    return null
  }
}
