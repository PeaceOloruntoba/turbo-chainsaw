import type { Endpoint } from 'payload'
import { isAdmin } from '../access'
import { toCsv } from './commercial'

/**
 * GET /api/members/export — CSV of all member accounts (Super Administrators
 * only). Contains contact details but never passwords, tokens or provider IDs.
 */
export const membersExportHandler: Endpoint['handler'] = async (req) => {
  const headers = { 'Cache-Control': 'no-store, max-age=0' }
  if (!isAdmin(req.user)) return Response.json({ error: 'Forbidden' }, { status: 403, headers })

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs: any[] = []
    for (let page = 1; page <= 200; page += 1) {
      const result = await req.payload.find({
        collection: 'members',
        sort: 'createdAt',
        limit: 500,
        page,
        depth: 0,
        overrideAccess: false,
        user: req.user,
      })
      docs.push(...result.docs)
      if (!result.hasNextPage) break
    }

    const csv = toCsv(
      [
        'Email', 'First name', 'Surname', 'Organisation', 'Job title', 'Country', 'Phone',
        'Account type', 'Access level', 'Status', 'Institutional approval',
        'Subscription plan', 'Subscription state', 'Subscription started', 'Access expires',
        'Terms accepted', 'Last sign-in', 'Registered',
      ],
      docs.map((d) => [
        d.email, d.firstName, d.surname, d.organisation, d.jobTitle, d.country, d.phone,
        d.accountType, d.accessLevel, d.status, d.approvalStatus,
        d.subscription?.plan, d.subscription?.state,
        d.subscription?.startedAt?.slice?.(0, 10), d.subscription?.expiresAt?.slice?.(0, 10),
        d.termsAcceptedAt, d.lastLoginAt, d.createdAt,
      ]),
    )

    return new Response(csv, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nigeria-lex-members-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'members export failed' })
    return Response.json({ error: 'Export failed' }, { status: 500, headers })
  }
}
