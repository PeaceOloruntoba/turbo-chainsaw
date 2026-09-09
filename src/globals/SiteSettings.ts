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
          'Header logo. Falls back to the approved Nigeria Lex logo already in the codebase (public/logo-lockup.png) until you upload a different file here — e.g. a higher-resolution or alternate version.',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Not yet wired to the live site — the actual browser favicon currently comes from src/app/icon.png (already set to the real Nigeria Lex mark). Uploading here has no effect yet; kept as a placeholder field for when dynamic favicon support is added.',
      },
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
        'Law firms and practitioners do not pay to be considered, included or recognised by Nigeria Lex. Sponsorship, advertising, subscriptions and other commercial relationships are kept separate from the research and editorial process and do not determine research outcomes.',
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
