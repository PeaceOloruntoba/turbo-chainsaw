import { revalidatePath as nextRevalidatePath } from 'next/cache'

/**
 * Wraps Next.js's revalidatePath so it's safe to call from Payload hooks
 * that also run outside a live Next.js server — e.g. the seed script
 * (`npm run seed`) or any future Payload CLI command (`migrate`, etc.),
 * both of which use the Local API directly via a standalone Node process.
 * revalidatePath depends on Next's internal request-scoped store, which
 * doesn't exist in that context and would otherwise throw and abort the
 * write. Safe to call from anywhere for that reason.
 */
export function safeRevalidatePath(path: string, type?: 'layout' | 'page') {
  try {
    nextRevalidatePath(path, type)
  } catch {
    // Not running inside a live Next.js server request (e.g. `npm run
    // seed`, or a Payload CLI command) — nothing to revalidate, safe no-op.
  }
}
