// Promotes a Users account to role: 'admin'. Pure — safe to import from
// both a live Next.js route (src/app/api/make-admin/route.ts) and the
// standalone CLI wrapper (src/seed/makeAdminCli.ts).
//
// Why this exists: new accounts default to role: 'editor' (see
// src/collections/Users.ts) — including the very first account created
// through Payload's "create your first user" screen at /admin, unless
// "Administrator" was deliberately picked from the role dropdown at
// signup. Only an admin can change roles or delete records (see each
// collection's `access` block), so if nobody ever holds the admin role,
// there's no way to grant it from inside the admin UI — a classic
// bootstrapping lockout.
//
// This runs via Payload's Local API, which — unlike a normal request —
// bypasses collection `access` control by default, so it can fix that
// lockout directly against the database.
//
// After running it (either way), log out and back in at /admin — an
// already-open session's cookie was issued before the change and won't
// reflect the new role until you re-authenticate.

import type { Payload } from 'payload'

export async function promoteToAdmin(
  payload: Payload,
  emailInput: string,
): Promise<{ status: 'promoted' | 'already-admin' | 'not-found'; email: string }> {
  const email = emailInput.trim().toLowerCase()

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })

  const user = existing.docs[0]

  if (!user) {
    return { status: 'not-found', email }
  }

  if (user.role === 'admin') {
    return { status: 'already-admin', email }
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { role: 'admin' },
  })

  return { status: 'promoted', email }
}
