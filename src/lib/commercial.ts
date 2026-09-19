import type { PayloadRequest } from 'payload'
import { userDisplayName, userOrganisationCode } from '../access'

/**
 * Shared definitions and helpers for the private Commercial Register.
 * Used by the collection config, the audit hooks, the CSV export and the
 * summary endpoint, so option lists and field labels live in exactly one place.
 */

export type Option = { label: string; value: string }

export const OPPORTUNITY_TYPES: Option[] = [
  { label: 'Subscriptions', value: 'subscriptions' },
  { label: 'Sponsorship', value: 'sponsorship' },
  { label: 'Institutional partnership', value: 'institutional_partnership' },
  { label: 'Reports / research products', value: 'reports_research' },
  { label: 'Events / roundtables', value: 'events_roundtables' },
  { label: 'Advertising', value: 'advertising' },
  { label: 'Licensing', value: 'licensing' },
  { label: 'Commissioned research', value: 'commissioned_research' },
  { label: 'Other agreed commercial activity', value: 'other' },
]

export const ORIGINATING_PARTIES: Option[] = [
  { label: 'K&C / Nigeria Lex', value: 'kc_nigeria_lex' },
  { label: 'SBM', value: 'sbm' },
  { label: 'Joint', value: 'joint' },
]

export const STATUSES: Option[] = [
  { label: 'Lead', value: 'lead' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Meeting arranged', value: 'meeting_arranged' },
  { label: 'Proposal in preparation', value: 'proposal_in_preparation' },
  { label: 'Proposal issued', value: 'proposal_issued' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Agreed', value: 'agreed' },
  { label: 'Invoiced', value: 'invoiced' },
  { label: 'Part-paid', value: 'part_paid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Closed / unsuccessful', value: 'closed_unsuccessful' },
]

export const DISTRIBUTION_STATUSES: Option[] = [
  { label: 'Not applicable', value: 'not_applicable' },
  { label: 'Not yet due', value: 'not_due' },
  { label: 'Due', value: 'due' },
  { label: 'Part-paid', value: 'part_paid' },
  { label: 'Paid', value: 'paid' },
  { label: 'On hold / disputed', value: 'on_hold' },
]

export const CURRENCIES: Option[] = [
  { label: 'NGN — Nigerian naira', value: 'NGN' },
  { label: 'GBP — Pound sterling', value: 'GBP' },
  { label: 'USD — US dollar', value: 'USD' },
  { label: 'EUR — Euro', value: 'EUR' },
]

export const RECORD_STATES: Option[] = [
  { label: 'Active', value: 'active' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Archived', value: 'archived' },
]

/** Statuses counted as "open pipeline" (not yet agreed). */
export const OPEN_STATUSES = [
  'lead',
  'contacted',
  'meeting_arranged',
  'proposal_in_preparation',
  'proposal_issued',
  'negotiation',
]
/** Statuses counted as "agreed" business. */
export const AGREED_STATUSES = ['agreed', 'invoiced', 'part_paid', 'paid']

/* ── Field metadata (drives audit diffs and CSV columns) ──────────── */

export type FieldKind = 'text' | 'number' | 'date' | 'bool' | 'select'
export type FieldMeta = { name: string; label: string; kind: FieldKind; options?: Option[] }

export const FIELD_META: FieldMeta[] = [
  { name: 'reference', label: 'Reference', kind: 'text' },
  { name: 'dateCreated', label: 'Date created', kind: 'date' },
  { name: 'organisation', label: 'Organisation / prospective customer', kind: 'text' },
  { name: 'contactPerson', label: 'Contact person', kind: 'text' },
  { name: 'contactDetails', label: 'Contact details', kind: 'text' },
  { name: 'opportunityType', label: 'Opportunity type', kind: 'select', options: OPPORTUNITY_TYPES },
  { name: 'originatingParty', label: 'Originating party', kind: 'select', options: ORIGINATING_PARTIES },
  { name: 'nigeriaLexContact', label: 'Nigeria Lex contact responsible', kind: 'text' },
  { name: 'description', label: 'Description of opportunity', kind: 'text' },
  { name: 'status', label: 'Stage / status', kind: 'select', options: STATUSES },
  { name: 'proposalIssued', label: 'Proposal or quotation issued', kind: 'bool' },
  { name: 'proposalDate', label: 'Proposal / quotation date', kind: 'date' },
  { name: 'currency', label: 'Currency', kind: 'select', options: CURRENCIES },
  { name: 'estimatedValue', label: 'Estimated value', kind: 'number' },
  { name: 'agreedValue', label: 'Agreed commercial value', kind: 'number' },
  { name: 'invoiceNumber', label: 'Invoice number', kind: 'text' },
  { name: 'invoiceDate', label: 'Invoice date', kind: 'date' },
  { name: 'amountInvoiced', label: 'Amount invoiced', kind: 'number' },
  { name: 'amountReceived', label: 'Amount received', kind: 'number' },
  { name: 'paymentReceivedDate', label: 'Date payment received', kind: 'date' },
  { name: 'originationEntitlement', label: 'Origination entitlement', kind: 'text' },
  { name: 'distributionStatus', label: 'Distribution / payment status', kind: 'select', options: DISTRIBUTION_STATUSES },
  { name: 'nextAction', label: 'Next action', kind: 'text' },
  { name: 'nextActionDate', label: 'Next-action date', kind: 'date' },
  { name: 'notes', label: 'Notes', kind: 'text' },
  { name: 'recordState', label: 'Record state', kind: 'select', options: RECORD_STATES },
  { name: 'archiveReason', label: 'Cancelled / archived reason', kind: 'text' },
]

/** Fields that identify who touched a record (CSV only — not diffed). */
export const SYSTEM_COLUMNS: Array<{ name: string; label: string }> = [
  { name: 'createdByName', label: 'Created by' },
  { name: 'createdByOrganisation', label: 'Created by (organisation)' },
  { name: 'createdAt', label: 'Created at (system time)' },
  { name: 'lastModifiedByName', label: 'Last modified by' },
  { name: 'updatedAt', label: 'Last modified at (system time)' },
]

/** Text fields searched by the list search box and the export `search` param. */
export const SEARCH_FIELDS = [
  'reference',
  'organisation',
  'contactPerson',
  'nigeriaLexContact',
  'description',
  'invoiceNumber',
  'nextAction',
  'notes',
]

/* ── Value helpers ─────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>

export function normaliseValue(meta: FieldMeta, value: unknown): string | number | boolean | null {
  if (value === undefined || value === null || value === '') return null
  switch (meta.kind) {
    case 'number':
      return Number(value)
    case 'date':
      return String(value).slice(0, 10)
    case 'bool':
      return Boolean(value)
    default:
      return String(value)
  }
}

/** Human-readable value (select labels, Yes/No) used in audit + CSV. */
export function displayValue(meta: FieldMeta, value: unknown): string {
  const v = normaliseValue(meta, value)
  if (v === null) return ''
  if (meta.kind === 'bool') return v ? 'Yes' : 'No'
  if (meta.kind === 'select') return meta.options?.find((o) => o.value === v)?.label ?? String(v)
  return String(v)
}

export type FieldChange = { field: string; label: string; from: string | null; to: string | null }

/** Field-by-field differences, with previous and new values. */
export function diffRegisterDocs(before: Doc | undefined | null, after: Doc): FieldChange[] {
  const changes: FieldChange[] = []
  for (const meta of FIELD_META) {
    if (meta.name === 'reference') continue
    if (normaliseValue(meta, before?.[meta.name]) !== normaliseValue(meta, after?.[meta.name])) {
      changes.push({
        field: meta.name,
        label: meta.label,
        from: displayValue(meta, before?.[meta.name]) || null,
        to: displayValue(meta, after?.[meta.name]) || null,
      })
    }
  }
  return changes
}

/** All non-empty tracked values at creation / deletion time. */
export function snapshotRegisterDoc(doc: Doc): FieldChange[] {
  return FIELD_META.map((meta) => ({
    field: meta.name,
    label: meta.label,
    from: null,
    to: displayValue(meta, doc?.[meta.name]) || null,
  })).filter((c) => c.to !== null)
}

export function summariseChanges(changes: FieldChange[], max = 900): string {
  const text = changes.map((c) => `${c.label}: ${c.from ?? '—'} → ${c.to ?? '—'}`).join('; ')
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/* ── Audit + reference helpers (server only) ──────────────────────── */

export type AuditAction = 'create' | 'update' | 'archive' | 'restore' | 'delete' | 'export'

export async function writeAudit(
  req: PayloadRequest,
  entry: {
    action: AuditAction
    entryId?: string
    entryReference?: string
    summary: string
    changes?: unknown
  },
) {
  const user = req.user
  await req.payload.create({
    collection: 'commercial-audit-log' as never,
    data: {
      action: entry.action,
      entryId: entry.entryId,
      entryReference: entry.entryReference,
      summary: entry.summary,
      changes: entry.changes ?? [],
      changedBy: user?.collection === 'users' ? user.id : undefined,
      changedByName: userDisplayName(user),
      changedByEmail: user?.email ?? undefined,
      changedByOrganisation: userOrganisationCode(user),
    } as never,
    // Same request => same DB transaction: if the audit row cannot be written,
    // the change itself is rolled back rather than going unrecorded.
    req,
    overrideAccess: true,
    depth: 0,
  })
}

/** Next sequential reference, e.g. NLCR-00042. */
export async function nextReference(req: PayloadRequest): Promise<string> {
  const last = await req.payload.find({
    collection: 'commercial-register' as never,
    sort: '-reference',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const lastRef = (last.docs[0] as Doc | undefined)?.reference as string | undefined
  const n = lastRef ? parseInt(lastRef.replace(/\D/g, ''), 10) || 0 : 0
  return `NLCR-${String(n + 1).padStart(5, '0')}`
}

/* ── Dashboard maths ───────────────────────────────────────────────── */

type PartyTotals = { count: number; pipeline: number; agreed: number; invoiced: number; received: number }
type CurrencyTotals = {
  pipeline: number
  agreed: number
  invoiced: number
  received: number
  outstanding: number
  byParty: Record<string, PartyTotals>
}

const emptyParty = (): PartyTotals => ({ count: 0, pipeline: 0, agreed: 0, invoiced: 0, received: 0 })

/**
 * Totals are ALWAYS kept per currency — amounts in different currencies are
 * never added together.
 *  • pipeline  = open opportunities (Lead → Negotiation): agreed value if set, otherwise estimated value
 *  • agreed    = agreed value on Agreed / Invoiced / Part-paid / Paid
 *  • invoiced / received = sums across all active (non-cancelled, non-archived) entries
 */
export function summariseRegister(docs: Doc[]) {
  const byStatus: Record<string, number> = {}
  const byPartyCount: Record<string, number> = {}
  const byCurrency: Record<string, CurrencyTotals> = {}

  for (const doc of docs) {
    if (doc.recordState && doc.recordState !== 'active') continue

    byStatus[doc.status] = (byStatus[doc.status] ?? 0) + 1
    byPartyCount[doc.originatingParty] = (byPartyCount[doc.originatingParty] ?? 0) + 1

    const currency = doc.currency || 'NGN'
    const bucket = (byCurrency[currency] ??= {
      pipeline: 0,
      agreed: 0,
      invoiced: 0,
      received: 0,
      outstanding: 0,
      byParty: {},
    })
    const party = (bucket.byParty[doc.originatingParty] ??= emptyParty())

    const agreed = Number(doc.agreedValue) || 0
    const estimated = Number(doc.estimatedValue) || 0
    const invoiced = Number(doc.amountInvoiced) || 0
    const received = Number(doc.amountReceived) || 0

    party.count += 1
    if (OPEN_STATUSES.includes(doc.status)) {
      const value = agreed || estimated
      bucket.pipeline += value
      party.pipeline += value
    }
    if (AGREED_STATUSES.includes(doc.status)) {
      bucket.agreed += agreed
      party.agreed += agreed
    }
    bucket.invoiced += invoiced
    bucket.received += received
    party.invoiced += invoiced
    party.received += received
  }

  for (const bucket of Object.values(byCurrency)) bucket.outstanding = bucket.invoiced - bucket.received

  return {
    generatedAt: new Date().toISOString(),
    records: Object.values(byStatus).reduce((a, b) => a + b, 0),
    byStatus,
    byParty: byPartyCount,
    byCurrency,
  }
}

/* ── CSV ────────────────────────────────────────────────────────────── */

const PHONE_LIKE = /^[+-]?[\d\s().-]+$/

/** Quotes a CSV cell and neutralises spreadsheet formula injection: text a
 * user typed into the register (e.g. `=HYPERLINK(...)`) must not execute when
 * an exported file is opened in Excel. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let text = String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text) && !PHONE_LIKE.test(text)) {
    text = `'${text}`
  }
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  // UTF-8 BOM so Excel opens accented characters correctly.
  return `\uFEFF${[headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`
}
