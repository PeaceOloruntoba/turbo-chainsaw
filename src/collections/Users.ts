import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { adminOnly, adminOnlyField, isAdmin, isContentTeam, isStaff } from '../access'
import { validatePassword } from '../lib/passwordPolicy'

/**
 * Staff accounts: the Nigeria Lex team AND authorised SBM personnel.
 * This is the collection Payload's admin panel logs into (HTTP-only cookie
 * JWT). Public-site accounts live in a completely separate `members`
 * collection (see Members.ts); newsletter sign-ups are a third, non-login
 * collection (Subscribers.ts).
 *
 * ROLES
 *  admin              Super Administrator (K&C / Nigeria Lex). Full control of the
 *                     site, the user-access system and the Commercial Register.
 *  editor / researcher  Website content + audience data. No Commercial Register.
 *  commercial_editor  Commercial Register only: view everything, create and amend entries.
 *  commercial_viewer  Commercial Register only: read-only.
 *
 * The existing value 'admin' is kept (not renamed) so current accounts and
 * the make-admin recovery route keep working.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 hours
    maxLoginAttempts: 5, // account is locked after 5 wrong passwords…
    lockTime: 15 * 60 * 1000, // …for 15 minutes
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'organisation', 'active'],
    group: 'Members & Access',
    description:
      'Staff logins: Nigeria Lex / K&C team and authorised SBM users. Suspend a user by un-ticking "Active".',
  },
  access: {
    // Only staff who may open the admin panel at all (suspended users cannot).
    admin: ({ req: { user } }) => isStaff(user),
    read: ({ req: { user } }) => {
      if (isAdmin(user)) return true
      // Content team can pick authors etc., but only see other content-team accounts.
      if (isContentTeam(user)) return { role: { in: ['admin', 'editor', 'researcher'] } }
      // Commercial users (e.g. SBM) can only see their own account.
      if (isStaff(user)) return { id: { equals: user?.id } }
      return false
    },
    create: adminOnly,
    update: ({ req: { user } }) => {
      if (isAdmin(user)) return true
      // Everyone else may edit only their own record (name, email, password);
      // role / organisation / active are locked by field-level access below.
      if (isStaff(user)) return { id: { equals: user?.id } }
      return false
    },
    delete: adminOnly,
    unlock: adminOnly,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.password) {
          const problem = validatePassword(data.password, data.email)
          if (problem) throw new APIError(problem, 400, undefined, true)
        }
        return data
      },
    ],
    // Best effort: also apply the policy on the password-reset flow.
    beforeOperation: [
      ({ args, operation }) => {
        if ((operation as string) === 'resetPassword') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const problem = validatePassword((args as any)?.data?.password)
          if (problem) throw new APIError(problem, 400, undefined, true)
        }
        return args
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user.active === false) {
          throw new APIError(
            'This account has been suspended. Please contact a Nigeria Lex administrator.',
            403,
            undefined,
            true,
          )
        }
        return user
      },
    ],
    beforeChange: [
      // Never allow the last active Super Administrator to be demoted or suspended.
      async ({ data, originalDoc, operation, req }) => {
        if (operation !== 'update' || !originalDoc) return data
        const wasActiveAdmin = originalDoc.role === 'admin' && originalDoc.active !== false
        const staysActiveAdmin =
          (data.role ?? originalDoc.role) === 'admin' && (data.active ?? originalDoc.active) !== false
        if (wasActiveAdmin && !staysActiveAdmin) {
          const others = await req.payload.count({
            collection: 'users',
            where: {
              and: [
                { role: { equals: 'admin' } },
                { id: { not_equals: originalDoc.id } },
                { active: { not_equals: false } },
              ],
            },
            overrideAccess: true,
            req,
          })
          if (others.totalDocs === 0) {
            throw new APIError(
              'At least one active Super Administrator must remain.',
              400,
              undefined,
              true,
            )
          }
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        if (String(req.user?.id) === String(id)) {
          throw new APIError('You cannot delete your own account.', 400, undefined, true)
        }
        const target = await req.payload.findByID({
          collection: 'users',
          id,
          depth: 0,
          overrideAccess: true,
          req,
        })
        if (target?.role === 'admin') {
          const others = await req.payload.count({
            collection: 'users',
            where: {
              and: [
                { role: { equals: 'admin' } },
                { id: { not_equals: id } },
                { active: { not_equals: false } },
              ],
            },
            overrideAccess: true,
            req,
          })
          if (others.totalDocs === 0) {
            throw new APIError('At least one active Super Administrator must remain.', 400, undefined, true)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Super Administrator (K&C / Nigeria Lex)', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Researcher', value: 'researcher' },
        { label: 'Commercial Register — editor', value: 'commercial_editor' },
        { label: 'Commercial Register — view only', value: 'commercial_viewer' },
      ],
      access: { update: adminOnlyField },
      admin: {
        description:
          'Controls what this person can see and change. Commercial Register roles give NO access to website content, research submissions or subscribers.',
      },
    },
    {
      name: 'organisation',
      type: 'select',
      defaultValue: 'kc',
      options: [
        { label: 'K&C / Nigeria Lex', value: 'kc' },
        { label: 'SBM Intelligence', value: 'sbm' },
      ],
      access: { update: adminOnlyField },
      admin: {
        description: 'Shown in the Commercial Register audit trail so it is clear which party made each change.',
      },
    },
    {
      name: 'active',
      label: 'Active',
      type: 'checkbox',
      defaultValue: true,
      access: { update: adminOnlyField },
      admin: {
        position: 'sidebar',
        description: 'Un-tick to suspend this user immediately. Their history in the audit trail is kept.',
      },
    },
  ],
}
