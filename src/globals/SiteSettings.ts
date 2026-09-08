import type { GlobalConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Site Configuration',
    description: 'Logo, name, and correspondence details used across the site.',
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        // Logo, site name, footer, and contact details all render via the
        // shared Header/Footer, so every page under the site layout needs
        // to be revalidated, not just one route.
        safeRevalidatePath('/', 'layout')
        return doc
      },
    ],
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Header logo (horizontal lockup preferred). Falls back to the placeholder mark until set.',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Square icon used for the browser tab / favicon.' },
    },
    { name: 'siteName', type: 'text', required: true, defaultValue: 'Nigeria Lex' },
    {
      name: 'strapline',
      type: 'text',
      required: true,
      defaultValue: 'Legal Market Intelligence for Informed Decisions',
    },
    {
      name: 'independenceStatement',
      type: 'textarea',
      required: true,
      defaultValue:
        'Nigeria Lex does not charge law firms or practitioners for consideration, inclusion or recognition in its research. Sponsorship, subscriptions and other commercial relationships do not determine research outcomes.',
      admin: {
        description: 'Shown on the Homepage and Research page independence banner.',
      },
    },
    {
      name: 'footerCopyright',
      type: 'text',
      required: true,
      defaultValue:
        '© {year} Kaye & Crowther Limited. All rights reserved. Nigeria Lex™ is a trade mark of Kaye & Crowther Limited.',
      admin: {
        description: 'Use {year} as a placeholder — it is replaced with the current year automatically.',
      },
    },
    {
      name: 'correspondence',
      type: 'group',
      fields: [
        {
          name: 'lagos',
          type: 'textarea',
          defaultValue: 'Nigeria Lex correspondence address to be confirmed.',
        },
        {
          name: 'london',
          type: 'textarea',
          defaultValue: 'International presence — address to be confirmed.',
        },
      ],
    },
    {
      name: 'departmentalEmails',
      type: 'array',
      labels: { singular: 'Department', plural: 'Departmental Emails' },
      defaultValue: [
        { label: 'Research', email: 'research@nigerialex.com' },
        { label: 'Editorial', email: 'editorial@nigerialex.com' },
        { label: 'Partnerships & Institutional Enquiries', email: 'partnerships@nigerialex.com' },
        { label: 'Events', email: 'events@nigerialex.com' },
        { label: 'General', email: 'info@nigerialex.com' },
      ],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
      ],
    },
  ],
}
