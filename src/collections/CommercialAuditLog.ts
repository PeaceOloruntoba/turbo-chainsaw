import type { CollectionConfig } from 'payload'
import { canViewRegister } from '../access'

/**
 * Append-only audit trail for the Commercial Register.
 *
 * Rows are written ONLY by server-side hooks (see CommercialRegister.ts and
 * lib/commercialEndpoints.ts). Nobody — including Super Administrators — can
 * create, edit or delete rows through the admin panel or the API. The entry is
 * referenced by plain text (`entryId` / `entryReference`) rather than a
 * relationship, so an audit row survives even if the entry it describes is
 * later deleted.
 */
export const CommercialAuditLog: CollectionConfig = {
  slug: 'commercial-audit-log',
  labels: { singular: 'Audit entry', plural: 'Audit Trail' },
  admin: {
    group: 'Commercial Register',
    useAsTitle: 'summary',
    defaultColumns: ['createdAt', 'action', 'entryReference', 'changedByName', 'summary'],
    listSearchableFields: ['entryReference', 'changedByName', 'summary'],
    description:
      'Who created or changed each register entry, when, and the previous values. Read-only and cannot be deleted.',
    hidden: ({ user }) => !canViewRegister(user),
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req: { user } }) => canViewRegister(user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Created', value: 'create' },
        { label: 'Amended', value: 'update' },
        { label: 'Cancelled / archived', value: 'archive' },
        { label: 'Restored', value: 'restore' },
        { label: 'Deleted', value: 'delete' },
        { label: 'Exported', value: 'export' },
      ],
      admin: { readOnly: true },
    },
    { name: 'entryReference', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'entryId', type: 'text', index: true, admin: { readOnly: true } },
    {
      name: 'changedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    { name: 'changedByName', type: 'text', admin: { readOnly: true } },
    { name: 'changedByEmail', type: 'text', admin: { readOnly: true } },
    {
      name: 'changedByOrganisation',
      type: 'select',
      options: [
        { label: 'K&C / Nigeria Lex', value: 'kc' },
        { label: 'SBM', value: 'sbm' },
      ],
      admin: { readOnly: true },
    },
    { name: 'summary', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'changes',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Field-by-field previous and new values.',
      },
    },
  ],
}
