import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
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
import { CommercialRegister } from "./collections/CommercialRegister";
import { CommercialAuditLog } from "./collections/CommercialAuditLog";
import { Members } from "./collections/Members";
import { RestrictedDocuments } from "./collections/RestrictedDocuments";
import { nigeriaLexEmailAdapter } from "./lib/payloadEmailAdapter";
import { storageMode } from "./lib/storage";

import { SiteSettings } from "./globals/SiteSettings";
import { HomeContent } from "./globals/HomeContent";
import { AboutContent } from "./globals/AboutContent";
import { ResearchContent } from "./globals/ResearchContent";
import { Pilot2026Content } from "./globals/Pilot2026Content";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const isVercel = Boolean(process.env.VERCEL);
const isDevelopment = process.env.NODE_ENV === "development";

/* ── Database: PostgreSQL only ─────────────────────────────────────
 * Development: Supabase Postgres (via Vercel / local `npm run dev`).
 * Production:  any PostgreSQL server (Supabase or your own).
 *
 * DATABASE_URI       postgresql://user:password@host:port/database
 * DATABASE_SCHEMA    Postgres schema Payload's tables live in (default "payload").
 *                    Keeping them OUT of Supabase's "public" schema stops the
 *                    Supabase Data API (PostgREST) from exposing them. The
 *                    schema must exist — see GUIDE, step "Create the schema".
 * DATABASE_SSL       require (default for remote hosts) | off | verify
 * DATABASE_SSL_CA    CA certificate text, only for DATABASE_SSL=verify
 * DATABASE_POOL_MAX  max connections held by this process (default 3 on Vercel, else 10)
 */
const databaseURL = process.env.DATABASE_URI || "";
const databaseSchema = process.env.DATABASE_SCHEMA?.trim() || "payload";

// `next build` and `payload generate:*` don't need a live database, so only
// complain about a missing/incorrect DATABASE_URI when the app or a
// database command really runs.
const skipDatabaseCheck =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.argv.some((arg) => /^generate:/.test(arg));

if (!/^postgres(ql)?:\/\//.test(databaseURL)) {
  const message =
    'DATABASE_URI must be a PostgreSQL connection string starting with "postgresql://". SQLite is no longer supported. See the step-by-step guide.';
  if (!skipDatabaseCheck) throw new Error(message);
  console.warn(`[db] ${message}`);
}

function buildPoolConfig(uri: string) {
  let connectionString = uri;
  let host = "";
  try {
    const url = new URL(uri);
    host = url.hostname;
    // TLS is configured below. A `sslmode=` in the URL would silently override it.
    url.searchParams.delete("sslmode");
    url.searchParams.delete("ssl");
    connectionString = url.toString();
  } catch {
    /* leave as-is; the driver will report a clear error */
  }

  const isLocalHost = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host);
  const sslMode = (process.env.DATABASE_SSL || (isLocalHost ? "off" : "require")).toLowerCase();
  const ca = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");

  const ssl =
    sslMode === "off"
      ? false
      : sslMode === "verify" && ca
        ? { ca, rejectUnauthorized: true }
        : // Encrypted, but the server certificate chain is not verified. This is
          // what Supabase's pooler needs unless you supply its CA certificate.
          { rejectUnauthorized: false };

  return {
    connectionString,
    ssl,
    max: Number(process.env.DATABASE_POOL_MAX) || (isVercel ? 3 : 10),
  };
}

// Schema changes: `push` applies them straight to the database (fast, used
// while developing); migrations (`npm run migrate`) are for production.
// Default: push ON for local `npm run dev`, OFF everywhere else.
// Override with PAYLOAD_DB_PUSH=true / false.
const pushDatabaseSchema =
  process.env.PAYLOAD_DB_PUSH === "true"
    ? true
    : process.env.PAYLOAD_DB_PUSH === "false"
      ? false
      : isDevelopment;

const useS3 = storageMode === "s3";

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
    // ── Private / access-controlled data (each in its own collection) ──
    CommercialRegister,
    CommercialAuditLog,
    Members,
    RestrictedDocuments,
  ],
  globals: [
    SiteSettings,
    HomeContent,
    AboutContent,
    ResearchContent,
    Pilot2026Content,
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  // Sends Payload's own emails (member verification, password resets for
  // members and staff) through the same SMTP settings as the other emails.
  email: nigeriaLexEmailAdapter,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: buildPoolConfig(databaseURL),
    schemaName: databaseSchema,
    migrationDir: path.resolve(dirname, "migrations"),
    push: pushDatabaseSchema,
  }),
  plugins: [
    ...(useS3
      ? [
          s3Storage({
            collections: {
              media: true,
              // Login-protected reports. Keep the bucket PRIVATE: Payload
              // streams these through its access-controlled file route.
              // (Only used when MEDIA_STORAGE=s3 — see src/lib/storage.ts.)
              "restricted-documents": { prefix: "restricted" },
            },
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
            // Browser uploads straight to the bucket (needed on Vercel, whose
            // request size limit is ~4.5 MB). Set S3_CLIENT_UPLOADS=false to
            // upload through the server instead (small files only).
            clientUploads: process.env.S3_CLIENT_UPLOADS !== "false",
          }),
        ]
      : []),
  ],
  cors: allowedOrigins,
  csrf: allowedOrigins,
});
