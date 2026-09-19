import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { canEditRegister, canViewRegister, isAdmin, userDisplayName, userOrganisationCode } from '../access'
import {
  CURRENCIES,
  DISTRIBUTION_STATUSES,
  OPPORTUNITY_TYPES,
  ORIGINATING_PARTIES,
  RECORD_STATES,
  STATUSES,
  diffRegisterDocs,
  nextReference,
  snapshotRegisterDoc,
  summariseChanges,
  writeAudit,
} from '../lib/commercial'
import { exportHandler, summaryHandler } from '../lib/commercialEndpoints'

/**
 * PRIVATE COMMERCIAL REGISTER — internal management tool shared by
 * Kaye & Crowther / Nigeria Lex and SBM Intelligence.
 *
 * • Never public: every operation requires a signed-in staff account with a
 *   commercial role (or Super Administrator). Members and anonymous visitors
 *   get nothing, and this data is not reachable from any public page.
 * • Everyone with access sees the FULL register.
 * • Entries are never deleted in normal use — mark them Cancelled / Archived
 *   (with a reason). Only a Super Administrator can hard-delete, and only an
 *   entry that is already cancelled/archived; the deletion is still logged
 *   with a full snapshot in the audit trail.
 * • Every create / amend / archive / restore / delete / export writes a row to
 *   the append-only `commercial-audit-log` in the same DB transaction.
 */
export const CommercialRegister: CollectionConfig = {
  slug: 'commercial-register',
  labels: { singular: 'Register entry', plural: 'Commercial Register' },
  admin: {
    group: 'Commercial Register',
    useAsTitle: 'organisation',
    defaultColumns: [
      'reference',
      'organisation',
      'opportunityType',
      'originatingParty',
      'status',
      'agreedValue',
      'amountInvoiced',
      'amountReceived',
      'nextActionDate',
    ],
    listSearchableFields: [
      'reference',
      'organisation',
      'contactPerson',
      'nigeriaLexContact',
      'description',
      'invoiceNumber',
    ],
    description:
      'Private commercial activity register for K&C / Nigeria Lex and SBM. Not visible to the public.',
    hidden: ({ user }) => !canViewRegister(user),
    components: {
      beforeListTable: [
        '@/components/admin/CommercialRegisterSummary#CommercialRegisterSummary',
      ],
    },
  },
  defaultSort: '-dateCreated',
  access: {
    read: ({ req: { user } }) => canViewRegister(user),
    create: ({ req: { user } }) => canEditRegister(user),
    update: ({ req: { user } }) => {
      if (isAdmin(user)) return true
      // Editors can amend (and archive) active entries. Once an entry is
      // cancelled/archived only a Super Administrator can change or restore it.
      if (canEditRegister(user)) return { recordState: { equals: 'active' } }
      return false
    },
    // Ordinary users can never delete. A Super Administrator may delete only
    // entries that are already cancelled/archived.
    delete: ({ req: { user } }) => (isAdmin(user) ? { recordState: { not_equals: 'active' } } : false),
  },
  endpoints: [
    { path: '/summary', method: 'get', handler: summaryHandler },
    { path: '/export', method: 'get', handler: exportHandler },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        const user = req.user
        const name = userDisplayName(user)
        const staffId = user?.collection === 'users' ? user.id : undefined

        if (operation === 'create') {
          data.reference = await nextReference(req)
          data.createdBy = staffId
          data.createdByName = name
          data.createdByOrganisation = userOrganisationCode(user)
        } else if (originalDoc) {
          // Ownership / reference are immutable, whatever the client sends.
          data.reference = originalDoc.reference
          data.createdBy = originalDoc.createdBy
          data.createdByName = originalDoc.createdByName
          data.createdByOrganisation = originalDoc.createdByOrganisation
        }

        data.lastModifiedBy = staffId
        data.lastModifiedByName = name

        const merged = { ...(originalDoc ?? {}), ...data }
        if (merged.recordState && merged.recordState !== 'active' && !String(merged.archiveReason ?? '').trim()) {
          throw new APIError(
            'Please give a reason when marking an entry Cancelled or Archived.',
            400,
            undefined,
            true,
          )
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'create') {
          await writeAudit(req, {
            action: 'create',
            entryId: String(doc.id),
            entryReference: doc.reference,
            summary: `Entry created for ${doc.organisation}`,
            changes: snapshotRegisterDoc(doc),
          })
          return doc
        }

        const changes = diffRegisterDocs(previousDoc, doc)
        if (changes.length === 0) return doc

        const stateChanged = changes.some((c) => c.field === 'recordState')
        await writeAudit(req, {
          action: stateChanged ? (doc.recordState === 'active' ? 'restore' : 'archive') : 'update',
          entryId: String(doc.id),
          entryReference: doc.reference,
          summary: summariseChanges(changes),
          changes,
        })
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await writeAudit(req, {
          action: 'delete',
          entryId: String(doc.id),
          entryReference: doc.reference,
          summary: `Entry permanently deleted (${doc.organisation})`,
          changes: snapshotRegisterDoc(doc),
        })
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Opportunity',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'dateCreated',
                  label: 'Date created',
                  type: 'date',
                  required: true,
                  defaultValue: () => new Date().toISOString(),
                  admin: {
                    width: '25%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
                    description: 'Date the opportunity was opened. Backdate if logging earlier activity.',
                  },
                },
                {
                  name: 'organisation',
                  label: 'Organisation / prospective customer',
                  type: 'text',
                  required: true,
                  index: true,
                  admin: { width: '75%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'contactPerson', label: 'Contact person', type: 'text', admin: { width: '50%' } },
                {
                  name: 'contactDetails',
                  label: 'Contact details',
                  type: 'text',
                  admin: { width: '50%', description: 'Email / phone.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'opportunityType',
                  label: 'Opportunity type',
                  type: 'select',
                  required: true,
                  index: true,
                  options: OPPORTUNITY_TYPES,
                  admin: { width: '50%' },
                },
                {
                  name: 'originatingParty',
                  label: 'Originating party',
                  type: 'select',
                  required: true,
                  index: true,
                  options: ORIGINATING_PARTIES,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'nigeriaLexContact',
              label: 'Nigeria Lex contact responsible',
              type: 'text',
            },
            { name: 'description', label: 'Description of opportunity', type: 'textarea' },
            {
              name: 'status',
              label: 'Stage / status',
              type: 'select',
              required: true,
              defaultValue: 'lead',
              index: true,
              options: STATUSES,
            },
          ],
        },
        {
          label: 'Proposal & value',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'proposalIssued',
                  label: 'Proposal or quotation issued',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { width: '50%' },
                },
                {
                  name: 'proposalDate',
                  label: 'Proposal / quotation date',
                  type: 'date',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
                    condition: (data) => Boolean(data?.proposalIssued),
                  },
                },
              ],
            },
            {
              name: 'currency',
              label: 'Currency',
              type: 'select',
              required: true,
              defaultValue: 'NGN',
              options: CURRENCIES,
              admin: {
                description:
                  'All amounts on this entry are in this currency. Dashboard totals are kept per currency and never added across currencies.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'estimatedValue',
                  label: 'Estimated value',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    description: 'Expected value while the opportunity is still open (used for pipeline value).',
                  },
                },
                {
                  name: 'agreedValue',
                  label: 'Agreed commercial value',
                  type: 'number',
                  min: 0,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Invoicing & receipts',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'invoiceNumber', label: 'Invoice number', type: 'text', index: true, admin: { width: '50%' } },
                {
                  name: 'invoiceDate',
                  label: 'Invoice date',
                  type: 'date',
                  admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'amountInvoiced',
                  label: 'Amount invoiced',
                  type: 'number',
                  min: 0,
                  admin: { width: '33%', description: 'Cumulative if there is more than one invoice.' },
                },
                {
                  name: 'amountReceived',
                  label: 'Amount received',
                  type: 'number',
                  min: 0,
                  admin: { width: '33%', description: 'Cumulative total received to date.' },
                },
                {
                  name: 'paymentReceivedDate',
                  label: 'Date payment received',
                  type: 'date',
                  admin: {
                    width: '34%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
                    description: 'Date of the latest payment.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Origination & distribution',
          fields: [
            {
              name: 'originationEntitlement',
              label: 'Origination entitlement',
              type: 'textarea',
              admin: {
                description:
                  'Where applicable: who is entitled and on what basis (e.g. % or amount), in line with the agreed origination terms.',
              },
            },
            {
              name: 'distributionStatus',
              label: 'Distribution / payment status',
              type: 'select',
              defaultValue: 'not_applicable',
              options: DISTRIBUTION_STATUSES,
            },
          ],
        },
        {
          label: 'Follow-up',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'nextAction', label: 'Next action', type: 'text', admin: { width: '70%' } },
                {
                  name: 'nextActionDate',
                  label: 'Next-action date',
                  type: 'date',
                  index: true,
                  admin: { width: '30%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
                },
              ],
            },
            { name: 'notes', label: 'Notes', type: 'textarea' },
          ],
        },
      ],
    },

    /* ── Sidebar: record control + audit stamps ─────────────────────── */
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Assigned automatically (NLCR-00001…).' },
    },
    {
      name: 'recordState',
      label: 'Record state',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: RECORD_STATES,
      admin: {
        position: 'sidebar',
        description:
          'Entered in error or withdrawn? Mark Cancelled / Archived here instead of deleting. History is kept.',
      },
    },
    {
      name: 'archiveReason',
      label: 'Cancelled / archived reason',
      type: 'text',
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data?.recordState && data.recordState !== 'active'),
      },
    },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar', readOnly: true } },
    { name: 'createdByName', label: 'Created by', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'createdByOrganisation',
      type: 'select',
      options: [
        { label: 'K&C / Nigeria Lex', value: 'kc' },
        { label: 'SBM', value: 'sbm' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'lastModifiedBy', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'lastModifiedByName',
      label: 'Last modified by',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
