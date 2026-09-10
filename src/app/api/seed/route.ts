import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { runSeed } from '@/seed/runSeed'

/**
 * Runs the same seed logic as `npm run seed`, but inside a live Next.js
 * server request instead of a standalone script. This exists because
 * Payload's standalone CLI/Local API bootstrap currently crashes on
 * Windows + Node 22+ with ERR_REQUIRE_ASYNC_MODULE / a broken @next/env
 * interop (open upstream bug — see README Troubleshooting). Running
 * inside `next dev` (or a deployed server) avoids that code path
 * entirely, since Next's own bundler handles the module loading instead
 * of Payload's CLI machinery.
 *
 * Protected by PAYLOAD_SECRET as a simple shared-secret check — this is
 * a developer/admin convenience endpoint, not a public API.
 *
 * Usage (with `npm run dev` running):
 *   http://localhost:3000/api/seed?secret=YOUR_PAYLOAD_SECRET
 */
async function handle(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (!process.env.PAYLOAD_SECRET || secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized — pass ?secret=<PAYLOAD_SECRET>' }, { status: 401 })
  }

  try {
    const payload = await getPayloadClient()
    const summary = await runSeed(payload)
    return NextResponse.json({ ok: true, summary })
  } catch (err: any) {
    console.error('[seed route] failed:', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle