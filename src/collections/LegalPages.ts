import type { CollectionConfig } from 'payload'

/**
 * Every footer legal page (Privacy Policy, Cookie Policy, Terms of Use,
 * Disclaimer, Editorial Independence, Corrections Policy) is a document in
 * this collection rather than a hardcoded page, so Nigeria Lex staff can
 * update legal copy from /admin without a developer.
 *
 * Seeded content (see src/seed) is clearly marked as a draft placeholder —
 * it must be reviewed and finalised by Nigeria Lex's legal counsel before
 * launch. Nothing here should be treated as reviewed legal advice.
 */
export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'reviewStatus', 'updatedAt'],
    group: 'Site Configuration',
    description: 'Privacy Policy, Terms of Use, and other footer legal pages.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Privacy Policy', value: 'privacy-policy' },
        { label: 'Cookie Policy', value: 'cookie-policy' },
        { label: 'Terms of Use', value: 'terms-of-use' },
        { label: 'Disclaimer', value: 'disclaimer' },
        { label: 'Editorial Independence', value: 'editorial-independence' },
        { label: 'Corrections Policy', value: 'corrections-policy' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'reviewStatus',
      type: 'select',
      required: true,
      defaultValue: 'draft_placeholder',
      options: [
        { label: 'Draft placeholder — not reviewed', value: 'draft_placeholder' },
        { label: 'Reviewed by counsel — final', value: 'final' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Shows a draft notice banner on the public page until marked Final.',
      },
    },
    { name: 'body', type: 'richText', required: true },
  ],
}
