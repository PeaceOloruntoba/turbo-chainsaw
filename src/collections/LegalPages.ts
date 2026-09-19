import type { CollectionConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'
import { isAdmin, isContentTeam } from '../access'

/**
 * Every footer legal page (Privacy Policy, Cookie Policy, Terms of Use,
 * Disclaimer, Editorial Independence, Corrections Policy) is a document in
 * this collection rather than a hardcoded page, so Nigeria Lex staff can
 * update legal copy from /admin without a developer.
 *
 * Seeded content (see src/seed) is client-approved and published. Staff can
 * continue to update these pages from the admin panel.
 */
export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'reviewStatus', 'updatedAt'],
    group: 'Site Configuration',
    description: 'Privacy Policy, Terms of Use, and other footer legal pages.',
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) safeRevalidatePath(`/legal/${doc.slug}`)
        // The footer renders every legal page's title/link on every page.
        safeRevalidatePath('/', 'layout')
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        if (doc?.slug) safeRevalidatePath(`/legal/${doc.slug}`)
        safeRevalidatePath('/', 'layout')
        return doc
      },
    ],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => isContentTeam(user),
    update: ({ req: { user } }) => isContentTeam(user),
    delete: ({ req: { user } }) => isAdmin(user),
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
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Draft pages show a notice on the public page until approved and published.',
      },
    },
    { name: 'body', type: 'richText', required: true },
  ],
}
