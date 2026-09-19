import type { Endpoint, PayloadRequest, Where } from 'payload'
import { canViewRegister } from '../access'
import {
  FIELD_META,
  SEARCH_FIELDS,
  SYSTEM_COLUMNS,
  displayValue,
  normaliseValue,
  summariseRegister,
  toCsv,
  writeAudit,
} from './commercial'

/**
 * Custom REST endpoints on the commercial-register collection:
 *   GET /api/commercial-register/summary   dashboard totals (JSON)
 *   GET /api/commercial-register/export    CSV export (opens in Excel)
 *
 * Both check the caller's role explicitly AND run every query with
 * `overrideAccess: false`, so collection-level access rules still apply.
 * Responses are never cacheable.
 */

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' }

const forbidden = () => Response.json({ error: 'Forbidden' }, { status: 403, headers: NO_STORE })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>

function urlOf(req: PayloadRequest) {
  return new URL(String(req.url))
}

/** Builds a Where from the same query the admin list view uses (`where[...]`,
 * `search`) so "Export" downloads exactly what the person is looking at. */
function buildWhere(req: PayloadRequest, opts: { activeOnly: boolean }): Where {
  const params = urlOf(req).searchParams
  const and: Where[] = []

  const rawWhere = (req as unknown as { query?: Record<string, unknown> }).query?.where
  if (rawWhere && typeof rawWhere === 'object') and.push(rawWhere as Where)

  const search = params.get('search')?.trim()
  if (search) and.push({ or: SEARCH_FIELDS.map((field) => ({ [field]: { like: search } })) })

  if (opts.activeOnly) and.push({ recordState: { equals: 'active' } })

  return and.length ? { and } : {}
}

function safeSort(raw: string | null, fallback: string) {
  return raw && /^-?[A-Za-z][A-Za-z0-9_.]*$/.test(raw) ? raw : fallback
}

async function fetchAll(
  req: PayloadRequest,
  collection: string,
  where: Where,
  sort: string,
): Promise<Doc[]> {
  const docs: Doc[] = []
  let page = 1
  for (;;) {
    const result = await req.payload.find({
      collection: collection as never,
      where,
      sort,
      limit: 500,
      page,
      depth: 0,
      overrideAccess: false,
      user: req.user,
    })
    docs.push(...(result.docs as Doc[]))
    if (!result.hasNextPage || page >= 200) break
    page += 1
  }
  return docs
}

export const summaryHandler: Endpoint['handler'] = async (req) => {
  if (!canViewRegister(req.user)) return forbidden()
  try {
    const docs = await fetchAll(req, 'commercial-register', {}, '-dateCreated')
    return Response.json(summariseRegister(docs), { headers: NO_STORE })
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'commercial-register summary failed' })
    return Response.json({ error: 'Could not build summary' }, { status: 500, headers: NO_STORE })
  }
}

export const exportHandler: Endpoint['handler'] = async (req) => {
  if (!canViewRegister(req.user)) return forbidden()

  const params = urlOf(req).searchParams
  const dataset = params.get('dataset') === 'audit' ? 'audit' : 'register'
  const stamp = new Date().toISOString().slice(0, 10)

  try {
    let csv: string
    let count: number

    if (dataset === 'audit') {
      const docs = await fetchAll(req, 'commercial-audit-log', {}, '-createdAt')
      count = docs.length
      csv = toCsv(
        ['Time (UTC)', 'Action', 'Entry reference', 'Entry ID', 'Changed by', 'Email', 'Organisation', 'Summary', 'Changes (JSON)'],
        docs.map((d) => [
          d.createdAt,
          d.action,
          d.entryReference,
          d.entryId,
          d.changedByName,
          d.changedByEmail,
          d.changedByOrganisation === 'sbm' ? 'SBM' : 'K&C / Nigeria Lex',
          d.summary,
          JSON.stringify(d.changes ?? []),
        ]),
      )
    } else {
      const where = buildWhere(req, { activeOnly: params.get('activeOnly') === 'true' })
      const sort = safeSort(params.get('sort'), '-dateCreated')
      const docs = await fetchAll(req, 'commercial-register', where, sort)
      count = docs.length
      const headers = [...FIELD_META.map((m) => m.label), ...SYSTEM_COLUMNS.map((c) => c.label)]
      csv = toCsv(
        headers,
        docs.map((d) => [
          ...FIELD_META.map((m) =>
            m.kind === 'number' ? normaliseValue(m, d[m.name]) : displayValue(m, d[m.name]),
          ),
          ...SYSTEM_COLUMNS.map((c) => d[c.name]),
        ]),
      )
    }

    // Exports of confidential data are themselves recorded in the audit trail.
    await writeAudit(req, {
      action: 'export',
      summary: `Exported ${count} ${dataset === 'audit' ? 'audit rows' : 'register rows'} to CSV`,
      changes: [{ dataset, rows: count, query: urlOf(req).search }],
    })

    return new Response(csv, {
      status: 200,
      headers: {
        ...NO_STORE,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nigeria-lex-${
          dataset === 'audit' ? 'commercial-audit-trail' : 'commercial-register'
        }-${stamp}.csv"`,
      },
    })
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'commercial-register export failed' })
    return Response.json({ error: 'Export failed' }, { status: 500, headers: NO_STORE })
  }
}
