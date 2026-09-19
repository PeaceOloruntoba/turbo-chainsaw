import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { isAdmin, isContentTeam } from '../access'

// Resolved as an absolute path (rather than a relative one) so upload
// location doesn't depend on the server's current working directory,
// which varies between `next dev`, `next start` and cPanel's Passenger
// process manager.
const dirname = path.dirname(fileURLToPath(import.meta.url))
const mediaDir = path.resolve(dirname, '../../public/media')

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => isContentTeam(user),
    update: ({ req: { user } }) => isContentTeam(user),
    delete: ({ req: { user } }) => isAdmin(user),
  },
  upload: {
    // Local disk storage — cPanel's own filesystem — instead of an S3/R2
    // bucket. Files land in /public/media at the project root and Next.js
    // serves them directly as static files at /media/<filename>. Make
    // sure /public/media is writable by the Node process on the server
    // (see DEPLOY_CPANEL.md) and is included in whatever you back up,
    // since — unlike a bucket — it lives on the same disk as the app.
    staticDir: '../../public/media',
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 900, height: undefined, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', admin: { description: 'Alt text for accessibility and SEO.' } },
    { name: 'caption', type: 'text' },
  ],
}
