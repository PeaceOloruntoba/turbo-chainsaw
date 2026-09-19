import type { CollectionConfig } from 'payload'
import path from 'path'
import { adminOnly, allowedLevelsFor, contentTeamField, contentTeamOnly, isContentTeam } from '../access'

/**
 * Downloadable reports / PDFs that must NOT be publicly downloadable.
 *
 * Unlike `media` (whose files sit in /public and are served by the web server
 * with no login check), files here are stored OUTSIDE the public folder and
 * are streamed by Payload's file route (/api/restricted-documents/file/…),
 * which runs the `read` rule below on every download. A guessed or shared URL
 * therefore returns 403 unless the viewer's access level is high enough.
 *
 * Storage location: set PRIVATE_MEDIA_DIR to an absolute path OUTSIDE the
 * deployed app folder (so deploys do not wipe it) and include it in backups.
 * When S3 storage is enabled (see payload.config.ts) files go to the bucket
 * under the `restricted/` prefix instead.
 */
const privateDir = process.env.PRIVATE_MEDIA_DIR || path.resolve(process.cwd(), 'private-media')

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
    staticDir: privateDir,
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
