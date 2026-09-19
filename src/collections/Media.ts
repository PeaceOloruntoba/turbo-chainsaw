import type { CollectionConfig } from 'payload'
import { isAdmin, isContentTeam } from '../access'
import { mediaDir } from '../lib/storage'

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
    // Where files go depends on the storage mode chosen in src/lib/storage.ts:
    //  • development (MEDIA_STORAGE=s3): Supabase Storage bucket — the S3 plugin
    //    in payload.config.ts takes over and this folder is not used.
    //  • production (MEDIA_STORAGE=local): this absolute folder on the server,
    //    <LOCAL_STORAGE_DIR>/media. Files are served by Payload's own file
    //    route (/api/media/file/<name>), so they are available immediately
    //    after upload — no rebuild or restart needed.
    staticDir: mediaDir,
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
