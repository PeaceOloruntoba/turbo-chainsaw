import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Firms } from './collections/Firms'
import { Lawyers } from './collections/Lawyers'
import { Intelligence } from './collections/Intelligence'
import { Events } from './collections/Events'
import { Subscribers } from './collections/Subscribers'
import { ResearchSubmissions } from './collections/ResearchSubmissions'
import { LegalPages } from './collections/LegalPages'

import { SiteSettings } from './globals/SiteSettings'
import { HomeContent } from './globals/HomeContent'
import { AboutContent } from './globals/AboutContent'
import { ResearchContent } from './globals/ResearchContent'
import { Pilot2026Content } from './globals/Pilot2026Content'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Nigeria Lex Admin',
    },
  },
  editor: lexicalEditor({}),
  sharp,
  collections: [
    Users,
    Media,
    Firms,
    Lawyers,
    Intelligence,
    Events,
    Subscribers,
    ResearchSubmissions,
    LegalPages,
  ],
  globals: [SiteSettings, HomeContent, AboutContent, ResearchContent, Pilot2026Content],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Direct Postgres connection to Supabase. Supabase Auth and Edge Functions
  // are deliberately not used — Payload owns auth and the schema directly.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT || undefined,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: Boolean(process.env.S3_FORCE_PATH_STYLE),
      },
    }),
  ],
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean),
})
