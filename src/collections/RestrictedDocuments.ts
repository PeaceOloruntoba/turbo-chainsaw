import type { CollectionConfig } from 'payload'
import { adminOnly, allowedLevelsFor, contentTeamField, contentTeamOnly, isContentTeam } from '../access'
import { restrictedDir } from '../lib/storage'

/**
 * Downloadable reports / PDFs that must NOT be publicly downloadable.
 *
 * Unlike `media` (whose files sit in /public and are served by the web server
 * with no login check), files here are stored OUTSIDE the public folder and
 * are streamed by Payload's file route (/api/restricted-documents/file/…),
 * which runs the `read` rule below on every download. A guessed or shared URL
 * therefore returns 403 unless the viewer's access level is high enough.
 *
 * Storage location (see src/lib/storage.ts):
 *  • development (MEDIA_STORAGE=s3): the Supabase bucket, under `restricted/`
 *  • production (MEDIA_STORAGE=local): <LOCAL_STORAGE_DIR>/restricted on the
 *    server — outside the app folder and never inside /public.
 */

export const RestrictedDocuments: CollectionConfig = {
  slug: 'restricted-documents',
  labels: { singular: 'Restricted document', plural: 'Restricted documents' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'accessLevel', 'filename', 'createdAt'],
    description:
      'Downloadable reports with login-protected downloads. Attach them to an Intelligence item; the item’s access level is applied to the file.',
  },
  upload: {
    staticDir: restrictedDir,
    mimeTypes: ['application/pdf'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (isContentTeam(user)) return true
      return { accessLevel: { in: allowedLevelsFor(user) } }
    },
    create: contentTeamOnly,
    update: contentTeamOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'accessLevel',
      type: 'select',
      defaultValue: 'subscriber',
      required: true,
      index: true,
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Registered users', value: 'registered' },
        { label: 'Subscribers / institutional users', value: 'subscriber' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Kept in step with the Intelligence item this file is attached to.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      access: { read: contentTeamField },
      admin: { description: 'Internal note (never returned to members or the public).' },
    },
  ],
}
