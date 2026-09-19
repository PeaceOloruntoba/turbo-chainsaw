import path from 'path'

/**
 * Where uploaded files (Media library images/PDFs and Restricted documents)
 * are stored. Decided ONCE here and used by payload.config.ts and by the
 * Media / RestrictedDocuments collections, so they can never disagree.
 *
 *   s3     Supabase Storage (S3-compatible bucket). Used for development.
 *   local  The server's own disk, under LOCAL_STORAGE_DIR. Used for production.
 *
 * HOW THE MODE IS CHOSEN (first match wins)
 *   1. MEDIA_STORAGE=s3 | local     ← explicit, and what we recommend you set
 *   2. NODE_ENV=development         → s3   (local `npm run dev`)
 *   3. running on Vercel            → s3   (Vercel's disk is read-only/ephemeral,
 *                                            and Vercel sets NODE_ENV=production
 *                                            even for a "dev" deployment, so
 *                                            NODE_ENV alone is not enough)
 *   4. anything else                → local (your own production server)
 *
 * Set MEDIA_STORAGE explicitly in every environment. That removes any doubt
 * about which mode is active.
 */
export type StorageMode = 's3' | 'local'

const explicit = process.env.MEDIA_STORAGE?.trim().toLowerCase()

if (explicit && explicit !== 's3' && explicit !== 'local') {
  console.warn(`[storage] Ignoring MEDIA_STORAGE="${explicit}" (expected "s3" or "local").`)
}

const requested: StorageMode =
  explicit === 's3' || explicit === 'local'
    ? explicit
    : process.env.NODE_ENV === 'development' || process.env.VERCEL
      ? 's3'
      : 'local'

export const s3Configured = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
)

function resolveMode(): StorageMode {
  if (requested === 's3' && !s3Configured) {
    const message =
      '[storage] S3 storage is selected but S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY are not all set.'
    if (process.env.VERCEL) {
      // Vercel has no writable disk, so falling back to local storage cannot work.
      throw new Error(`${message} Add them in Vercel → Settings → Environment Variables.`)
    }
    console.warn(`${message} Falling back to local disk storage.`)
    return 'local'
  }
  return requested
}

export const storageMode: StorageMode = resolveMode()

/* ── Local (production) folders ──────────────────────────────────── */

const configuredRoot = process.env.LOCAL_STORAGE_DIR?.trim()

if (
  storageMode === 'local' &&
  !configuredRoot &&
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build' &&
  !(globalThis as { __nlStorageWarned?: boolean }).__nlStorageWarned
) {
  ;(globalThis as { __nlStorageWarned?: boolean }).__nlStorageWarned = true
  console.warn(
    '[storage] LOCAL_STORAGE_DIR is not set. Uploads will be written under ./storage in the app folder, which a redeploy may wipe. Set LOCAL_STORAGE_DIR to an absolute path outside the app folder.',
  )
}

/** Absolute folder that holds everything uploaded (back this up). */
export const localStorageRoot = configuredRoot
  ? path.resolve(configuredRoot)
  : path.resolve(process.cwd(), 'storage')

/** Public Media library files (images, public PDFs). */
export const mediaDir = path.join(localStorageRoot, 'media')

/** Login-protected reports. Never inside /public and never web-served directly. */
export const restrictedDir = path.join(localStorageRoot, 'restricted')
