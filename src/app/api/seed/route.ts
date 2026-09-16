import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { promoteToAdmin } from '@/seed/makeAdmin'

/**
 * Promotes a Users account to role: 'admin' — inside a live Next.js
 * server request rather than the standalone CLI (`npm run make-admin`),
 * for the same reason /api/seed exists: Payload's standalone CLI/Local
 * API bootstrap currently crashes on Windows + Node 22+ with
 * ERR_REQUIRE_ASYNC_MODULE / a broken @next/env interop (open upstream
 * bug — see README Troubleshooting). Running inside `next dev` (or a
 * deployed server) avoids that code path entirely, since Next's own
 * bundler handles the module loading instead of Payload's CLI machinery.
 *
 * Protected by PAYLOAD_SECRET as a simple shared-secret check — this is
 * a developer/admin convenience endpoint, not a public API.
 *
 * Usage (with `npm run dev` running, or against the deployed site):
 *   http://localhost:3000/api/make-admin?secret=YOUR_PAYLOAD_SECRET&email=you@nigerialex.com
 *
 * Log out and back in at /admin afterward — an already-open session's
 * cookie was issued before the change and won't reflect the new role
 * until you re-authenticate.
 */
async function handle(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const email = req.nextUrl.searchParams.get('email')

  if (!process.env.PAYLOAD_SECRET || secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized — pass ?secret=<PAYLOAD_SECRET>' }, { status: 401 })
  }

  if (!email) {
    return NextResponse.json({ error: 'Pass ?email=<the account to promote>' }, { status: 400 })
  }

  try {
    const payload = await getPayloadClient()
    const result = await promoteToAdmin(payload, email)

    if (result.status === 'not-found') {
      return NextResponse.json(
        { ok: false, error: `No user found with email "${result.email}".` },
        { status: 404 },
      )
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    console.error('[make-admin route] failed:', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle