import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Firms } from "./collections/Firms";
import { Lawyers } from "./collections/Lawyers";
import { Intelligence } from "./collections/Intelligence";
import { Events } from "./collections/Events";
import { Subscribers } from "./collections/Subscribers";
import { ResearchSubmissions } from "./collections/ResearchSubmissions";
import { ContactMessages } from "./collections/ContactMessages";
import { LegalPages } from "./collections/LegalPages";

import { SiteSettings } from "./globals/SiteSettings";
import { HomeContent } from "./globals/HomeContent";
import { AboutContent } from "./globals/AboutContent";
import { ResearchContent } from "./globals/ResearchContent";
import { Pilot2026Content } from "./globals/Pilot2026Content";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const isVercel = Boolean(process.env.VERCEL);
const databaseURL = process.env.DATABASE_URI || "file:./data/nigeria-lex.db";
const usePostgres = isVercel || databaseURL.startsWith("postgres");
const pushDatabaseSchema = process.env.PAYLOAD_DB_PUSH === "true";
const useS3 = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
);

/**
 * Payload's `cors`/`csrf` allowlists are checked against the exact Origin
 * header of the incoming request. If the site is reachable at both
 * nigerialex.com and www.nigerialex.com (very common — DNS/cPanel usually
 * point both at the same app), but this list only contained the one URL
 * in NEXT_PUBLIC_SERVER_URL, then visiting the *other* host would still
 * render pages fine (that part isn't origin-checked) but every logged-in
 * write — saving a document, editing a dropdown field, changing a role —
 * would silently fail with "You are not allowed to perform this action.":
 * the browser's auth cookie gets rejected as cross-origin before it ever
 * reaches the collection's own access control, so it looks identical to
 * a permissions bug even though it's really a host mismatch.
 *
 * To avoid that trap, both the apex and `www.` variant of the configured
 * server URL are always allowed. Add any further hosts (a staging
 * subdomain, a temporary IP-based preview URL, etc.) via the comma-
 * separated ADDITIONAL_ALLOWED_ORIGINS env var rather than editing this
 * file — but the real fix is to only ever use ONE canonical hostname
 * (set that one in NEXT_PUBLIC_SERVER_URL) and redirect the other to it.
 */
function withWwwVariant(url: string): string[] {
  try {
    const u = new URL(url);
    const variants = new Set<string>([url]);
    if (u.hostname.startsWith("www.")) {
      u.hostname = u.hostname.slice(4);
    } else {
      u.hostname = `www.${u.hostname}`;
    }
    variants.add(u.origin);
    return Array.from(variants);
  } catch {
    return [url];
  }
}

const allowedOrigins = [
  ...withWwwVariant(serverURL),
  ...(process.env.ADDITIONAL_ALLOWED_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? []),
];

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "— Nigeria Lex Admin",
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
    ContactMessages,
    LegalPages,
  ],
  globals: [
    SiteSettings,
    HomeContent,
    AboutContent,
    ResearchContent,
    Pilot2026Content,
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: usePostgres
    ? postgresAdapter({
        pool: {
          connectionString: databaseURL,
        },
        push: pushDatabaseSchema,
      })
    : sqliteAdapter({
        client: {
          url: databaseURL,
        },
        push: pushDatabaseSchema,
      }),
  plugins: [
    ...(useS3
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.S3_BUCKET!,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
              },
              endpoint: process.env.S3_ENDPOINT || undefined,
              forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
              region: process.env.S3_REGION || "us-east-1",
            },
            clientUploads: true,
          }),
        ]
      : []),
  ],
  cors: allowedOrigins,
  csrf: allowedOrigins,
});
