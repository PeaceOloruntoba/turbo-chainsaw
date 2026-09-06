import type { CollectionConfig } from 'payload'

/**
 * Public subscription capture (Nigeria Lex Briefing). This collection is
 * intentionally NOT an auth collection — subscribers do not log in. Writes
 * happen only through the public /subscribe form via a scoped `create`
 * access rule; reading the list is staff-only.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'organisation', 'country', 'consented', 'createdAt'],
    group: 'Audience',
    description: 'Nigeria Lex Briefing subscribers, captured via the public Subscribe form.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // public submissions from the Subscribe page
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'surname', type: 'text', required: true },
    { name: 'organisation', type: 'text' },
    { name: 'jobTitle', type: 'text' },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    { name: 'country', type: 'text' },
    {
      name: 'areasOfInterest',
      type: 'select',
      hasMany: true,
      options: [
        'Legal Market Research',
        'Firms & Lawyers',
        'Market Intelligence',
        'Reports & Briefings',
        'Pilot 2026',
        'Events',
      ],
    },
    {
      name: 'consented',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: {
        description: 'Confirms the subscriber opted in to receive Nigeria Lex communications.',
      },
    },
    {
      name: 'unsubscribed',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
