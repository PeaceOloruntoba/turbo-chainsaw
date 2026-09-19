import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { adminOnly, adminOnlyField, isAdmin } from '../access'
import { validatePassword } from '../lib/passwordPolicy'
import { membersExportHandler } from '../lib/membersExport'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/**
 * PUBLIC-SITE MEMBER ACCOUNTS (Phase 2 — dormant until switched on).
 *
 * Completely separate from staff (`users`), the newsletter list
 * (`subscribers`), research submissions and the Commercial Register. A member
 * login grants access to nothing but gated public-site content; the shared
 * helpers in ../access make sure a member is never treated as staff.
 *
 * Levels (held in `accessLevel`):
 *   registered  free account, verified email
 *   subscriber  paid / institutional access to premium content
 * "Public" is simply "not logged in"; "Administrator / Research team" are
 * staff accounts in the `users` collection.
 *
 * Nothing is visible on the site until an administrator ticks
 * Site Settings → Member portal → Enabled (and, separately, Registration open).
 * Payment integration (Phase 3) attaches to the `subscription` group; no
 * payment code is active.
 */

// Fields a member may never change on their own account.
const PRIVILEGED_KEYS = [
  'email',
  'accessLevel',
  'status',
  'approvalStatus',
  'accountType',
  'subscription',
  'internalNotes',
  'lastLoginAt',
  'termsAcceptedAt',
]

const emailShell = (heading: string, body: string, link: string, cta: string) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0F1B2D">
    <h2 style="font-family:Georgia,serif;color:#0A192F">${heading}</h2>
    <p>${body}</p>
    <p><a href="${link}" style="display:inline-block;background:#005A36;color:#fff;padding:12px 22px;text-decoration:none;border-radius:2px">${cta}</a></p>
    <p style="font-size:12px;color:#55647A">If the button does not work, copy this link into your browser:<br>${link}</p>
    <p style="font-size:12px;color:#55647A">If you did not request this, you can ignore this email.</p>
    <p>Nigeria Lex</p>
  </div>`

export const Members: CollectionConfig = {
  slug: 'members',
  labels: { singular: 'Member', plural: 'Members' },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
    // Email verification is mandatory: unverified members cannot log in.
    verify: {
      generateEmailSubject: () => 'Verify your Nigeria Lex account',
      generateEmailHTML: (args) =>
        emailShell(
          'Verify your email address',
          'Thank you for registering with Nigeria Lex. Please confirm your email address to activate your account.',
          `${siteUrl}/account/verify?token=${args?.token}`,
          'Verify my email',
        ),
    },
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Nigeria Lex password',
      generateEmailHTML: (args) =>
        emailShell(
          'Reset your password',
          'We received a request to reset the password for your Nigeria Lex account. This link expires in one hour.',
          `${siteUrl}/account/reset-password?token=${args?.token}`,
          'Choose a new password',
        ),
    },
  },
  admin: {
    group: 'Members & Access',
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'surname', 'organisation', 'accessLevel', 'status', 'approvalStatus'],
    listSearchableFields: ['email', 'firstName', 'surname', 'organisation'],
    description:
      'Public-site accounts (registered users, subscribers, institutional users). Separate from staff logins and from newsletter subscribers.',
    hidden: ({ user }) => !isAdmin(user),
    components: {
      beforeListTable: ['@/components/admin/MembersExportLink#MembersExportLink'],
    },
  },
  endpoints: [{ path: '/export', method: 'get', handler: membersExportHandler }],
  access: {
    // Public self-registration — but only while an administrator has opened it.
    create: async ({ req }) => {
      if (isAdmin(req.user)) return true
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings: any = await req.payload.findGlobal({
          slug: 'site-settings',
          depth: 0,
          overrideAccess: true,
        })
        return Boolean(settings?.memberPortal?.enabled && settings?.memberPortal?.registrationOpen)
      } catch {
        return false
      }
    },
    // Administrators see every member; a member sees only their own record.
    read: ({ req: { user } }) => {
      if (isAdmin(user)) return true
      if (user?.collection === 'members') return { id: { equals: user.id } }
      return false
    },
    update: ({ req: { user } }) => {
      if (isAdmin(user)) return true
      if (user?.collection === 'members' && user.status !== 'suspended') return { id: { equals: user.id } }
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
    beforeChange: [
      ({ data, originalDoc, operation, req, context }) => {
        // Server-side bookkeeping writes (e.g. last-login stamp) are trusted.
        if ((context as { systemWrite?: boolean } | undefined)?.systemWrite === true) return data

        const admin = isAdmin(req.user)

        if (operation === 'create') {
          if (!admin) {
            if (!data.termsAccepted) {
              throw new APIError(
                'You must accept the Terms of Use and Privacy Policy to register.',
                400,
                undefined,
                true,
              )
            }
            // A self-registering visitor can never choose their own privileges.
            data.accessLevel = 'registered'
            data.status = 'active'
            data.approvalStatus = data.accountType === 'institutional' ? 'pending' : 'not_required'
            delete data.subscription
            delete data.internalNotes
            delete data.lastLoginAt
          }
          if (data.termsAccepted && !data.termsAcceptedAt) data.termsAcceptedAt = new Date().toISOString()
        } else if (!admin && originalDoc) {
          // Self-service edits: restore anything privileged to its stored value.
          for (const key of PRIVILEGED_KEYS) {
            if (key in data) data[key] = originalDoc[key]
          }
        }
        return data
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user.status === 'suspended') {
          throw new APIError(
            'This account has been suspended. Please contact Nigeria Lex.',
            403,
            undefined,
            true,
          )
        }
        return user
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
        try {
          await req.payload.update({
            collection: 'members',
            id: user.id,
            data: { lastLoginAt: new Date().toISOString() },
            overrideAccess: true,
            depth: 0,
            context: { systemWrite: true },
          })
        } catch {
          /* recording last-login must never block a sign-in */
        }
        return user
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'surname', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'organisation', type: 'text', admin: { width: '50%' } },
        { name: 'jobTitle', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'country', type: 'text', admin: { width: '50%' } },
        { name: 'phone', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'accountType',
      type: 'select',
      defaultValue: 'individual',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Institutional', value: 'institutional' },
      ],
      admin: { description: 'Institutional registrations are held for administrator approval.' },
    },

    /* ── Administrator-controlled ─────────────────────────────────── */
    {
      name: 'accessLevel',
      label: 'Access level',
      type: 'select',
      defaultValue: 'registered',
      options: [
        { label: 'Registered user', value: 'registered' },
        { label: 'Subscriber / institutional user', value: 'subscriber' },
      ],
      access: { update: adminOnlyField },
      admin: {
        position: 'sidebar',
        description: 'Upgrade / downgrade here. Subscriber access also respects "Access expires".',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
      ],
      access: { update: adminOnlyField },
      admin: { position: 'sidebar', description: 'Suspended members cannot sign in and lose all access at once.' },
    },
    {
      name: 'approvalStatus',
      label: 'Institutional approval',
      type: 'select',
      defaultValue: 'not_required',
      options: [
        { label: 'Not required', value: 'not_required' },
        { label: 'Pending approval', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      access: { update: adminOnlyField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'subscription',
      type: 'group',
      label: 'Subscription (ready for Phase 3 payments)',
      access: { update: adminOnlyField },
      admin: {
        description:
          'Set by an administrator for now. A payment provider can later write these same fields automatically.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'plan',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Individual', value: 'individual' },
                { label: 'Institutional', value: 'institutional' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'state',
              label: 'Subscription state',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Active', value: 'active' },
                { label: 'Past due', value: 'past_due' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Expired', value: 'expired' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'startedAt',
              label: 'Started',
              type: 'date',
              admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } },
            },
            {
              name: 'expiresAt',
              label: 'Access expires',
              type: 'date',
              admin: {
                width: '50%',
                date: { pickerAppearance: 'dayOnly' },
                description: 'Leave empty for no expiry. After this date subscriber access reverts to Registered.',
              },
            },
          ],
        },
        {
          name: 'provider',
          type: 'select',
          defaultValue: 'manual',
          options: [
            { label: 'Manual (no payment provider)', value: 'manual' },
            { label: 'Stripe', value: 'stripe' },
            { label: 'Paystack', value: 'paystack' },
            { label: 'Flutterwave', value: 'flutterwave' },
          ],
          access: { read: adminOnlyField },
        },
        { name: 'providerCustomerId', type: 'text', access: { read: adminOnlyField } },
        { name: 'providerSubscriptionId', type: 'text', access: { read: adminOnlyField } },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: adminOnlyField, update: adminOnlyField },
      admin: { description: 'Internal administrator notes. Never shown to the member.' },
    },

    /* ── System ───────────────────────────────────────────────────── */
    {
      name: 'termsAccepted',
      type: 'checkbox',
      admin: { hidden: true },
    },
    {
      name: 'termsAcceptedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
