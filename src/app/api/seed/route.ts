import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { runSeed } from '@/seed/runSeed'

export const dynamic = 'force-dynamic'

/**
 * Deployment bootstrap / recovery route. Not a public API.
 *
 * Actions
 *   push-schema   creates any NEW tables/columns (e.g. after deploying the
 *                 Commercial Register + member portal update). Does NOT touch
 *                 or overwrite any content. Use this on a live site.
 *   seed          push-schema + (re)inserts the default placeholder content.
 *                 WARNING: it overwrites existing pages/legal text/samples by
 *                 slug — do not run it on a live site with edited content.
 *   make-admin    promotes ?email= to Super Administrator (lockout recovery).
 *
 * Security
 *   • Requires SEED_SECRET (a dedicated value — NOT PAYLOAD_SECRET, which
 *     signs login sessions and must never appear in a URL). If SEED_SECRET is
 *     not set the route is disabled. Remove SEED_SECRET when you have finished.
 *   • Prefer sending the secret in the `x-seed-secret` header:
 *       curl -X POST -H "x-seed-secret: …" "https://nigerialex.com/api/seed?action=push-schema"
 *     The ?secret= query parameter still works for browser-based use, but URLs
 *     end up in server logs and browser history.
 *   • Compared in constant time.
 *
 * After running push-schema or seed, restart the app (Passenger "Restart")
 * so the running instance drops the schema-push flag.
 * After make-admin, log out and back in at /admin.
 */
function secretsMatch(provided: string | null, expected: string | undefined) {
  if (!provided || !expected) return false
  const a = crypto.createHash('sha256').update(provided).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(a, b)
}

async function handle(req: NextRequest) {
  const expected = process.env.SEED_SECRET
  if (!expected) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const provided = req.headers.get('x-seed-secret') ?? req.nextUrl.searchParams.get('secret')
  if (!secretsMatch(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = req.nextUrl.searchParams.get('email')
  const action = req.nextUrl.searchParams.get('action') || 'seed'

  if (!['seed', 'push-schema', 'make-admin'].includes(action)) {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  try {
    // This must happen before importing the Payload config. The adapter reads
    // this flag while the config is constructed, not when a query is made.
    if (action === 'seed' || action === 'push-schema') process.env.PAYLOAD_DB_PUSH = 'true'

    const [{ getPayload }, { default: config }, { promoteToAdmin }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
      import('@/seed/makeAdmin'),
    ])
    const payload = await getPayload({ config })

    if (action === 'push-schema') {
      return NextResponse.json({
        ok: true,
        action,
        message: 'Schema push requested. Restart the app, then check /admin.',
      })
    }

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

    const summary = await runSeed(payload)
    return NextResponse.json({ ok: true, action, ...summary })
  } catch (err: any) {
    console.error('[seed route] failed:', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
