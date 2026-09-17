import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { promoteToAdmin } from '@/seed/makeAdmin'
import { runSeed } from '@/seed/runSeed'

/**
 * Runs deployment bootstrap tasks inside a live Next.js request. This keeps
 * Vercel deployments fully functional without SSH, a shell, or a post-build
 * command. The same endpoint can promote the first admin account.
 *
 * Protected by PAYLOAD_SECRET as a simple shared-secret check — this is
 * a developer/admin convenience endpoint, not a public API.
 *
 * Usage:
 *   POST /api/seed?secret=YOUR_PAYLOAD_SECRET
 *   POST /api/seed?action=make-admin&secret=YOUR_PAYLOAD_SECRET&email=you@example.com
 *
 * Log out and back in at /admin afterward — an already-open session's
 * cookie was issued before the change and won't reflect the new role
 * until you re-authenticate.
 */
async function handle(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const email = req.nextUrl.searchParams.get('email')
  const action = req.nextUrl.searchParams.get('action') || 'seed'

  if (!process.env.PAYLOAD_SECRET || secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized — pass ?secret=<PAYLOAD_SECRET>' }, { status: 401 })
  }

  try {
    const payload = await getPayloadClient()
    if (action === 'make-admin') {
      if (!email) {
        return NextResponse.json({ error: 'Pass ?email=<the account to promote>' }, { status: 400 })
      }

      const result = await promoteToAdmin(payload, email)

      if (result.status === 'not-found') {
        return NextResponse.json(
          { ok: false, error: `No user found with email "${result.email}".` },
          { status: 404 },
        )
      }

      return NextResponse.json({ ok: true, action, ...result })
    }

    if (action !== 'seed') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const summary = await runSeed(payload)
    return NextResponse.json({ ok: true, action, ...summary })
  } catch (err: any) {
    console.error('[make-admin route] failed:', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle