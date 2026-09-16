import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
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

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
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
  // SQLite, stored as a single file on the app's own server storage
  // (see DATABASE_URI in .env — a local file path, e.g.
  // file:./data/nigeria-lex.db). This replaced the Supabase Postgres
  // connection so the whole stack — database and media — runs on cPanel's
  // own storage with no external service to provision or pay for.
  // Payload has no official MySQL adapter (its adapters are Postgres,
  // SQLite and MongoDB), so SQLite is the closest fit to "use cPanel's own
  // database" that Payload actually supports. See DEPLOY_CPANEL.md for
  // the full reasoning and the Postgres fallback if your cPanel plan
  // offers a real Postgres service instead.
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./data/nigeria-lex.db",
    },
  }),
  // Media uploads now live on local disk under /public/media (see
  // Media.ts `upload.staticDir`) instead of an S3/R2 bucket — this is
  // cPanel's own storage, served directly by Next.js as static files.
  // No storage plugin is needed for this; it's Payload's default
  // behaviour once no storage adapter plugin is registered.
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"].filter(
    Boolean,
  ),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"].filter(
    Boolean,
  ),
});
