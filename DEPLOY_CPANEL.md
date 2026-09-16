# Deploying Nigeria Lex on cPanel

This replaces the previous Supabase Postgres + S3/R2 setup with a
**self-contained stack that only needs cPanel's own storage**:

| Before                          | Now                                                |
| -------------------------------- | --------------------------------------------------- |
| Postgres on Supabase              | **SQLite** — a single file on the app's own disk    |
| Media on S3 / Cloudflare R2       | **Local disk** — `/public/media`, served by Next.js |

## Why not MySQL?

Payload CMS does not have an official MySQL/MariaDB adapter — only
**Postgres**, **SQLite**, and **MongoDB** are supported (Payload's core is
built on Drizzle ORM, which doesn't speak MySQL's dialect for Payload's
needs). This isn't a config option we skipped; it doesn't exist. If your
cPanel account only offers "MySQL Databases" in WHM (the common case),
SQLite is the closest match to "use the server's own storage, no external
DB to manage" — it's one file, no database server process to configure at
all.

If your specific cPanel plan happens to also offer a **real PostgreSQL
service** (some WHM installs do, via a Postgres Selector/phpPgAdmin), you
can use that instead with almost no code change — see "Alternative: using
cPanel Postgres" at the bottom of this file.

---

## Part 1 — Why your last deploy 500'd on `/intelligence`, `/intelligence/[slug]` and `/admin`

You built locally (`npm run build`) and uploaded the output. That is the
single most common cause of exactly this symptom — a page that works in
local dev/build but 500s only in the uploaded copy, and only on some
routes. Two things go wrong with "build locally, zip, upload":

1. **Native binaries don't travel.** `sharp` (image processing) and the
   new SQLite driver (`@libsql/client`, used by `@payloadcms/db-sqlite`)
   both ship platform-specific compiled binaries. A `node_modules` folder
   built on your Mac or Windows machine contains binaries for *that*
   OS/CPU, not for cPanel's Linux server. Node.js API routes and Server
   Components that touch these (admin panel data queries, Intelligence
   pages hitting the DB, image handling) fail at request time with a
   generic 500 — while simpler pages that don't happen to trigger the
   broken code path first can still render.
2. **Next.js's `output: 'standalone'` build has a specific file layout.**
   It produces `.next/standalone/server.js` plus a *separate*
   `.next/static` folder and your `public` folder, which must be copied
   **into** the standalone output by hand (Next does not do this for you).
   If any of that copy step was missed, or a zip/FTP transfer silently
   dropped or truncated a large manifest file, requests that need those
   manifests — again, admin and dynamic content routes — throw 500s while
   already-cached or simpler routes appear fine.

**The fix is to build on the server itself**, so the binaries match, and
to follow the exact standalone layout below. Do not zip a locally-built
`.next` folder and upload it again.

### Getting the real error (do this first if anything still 500s)

A generic "Internal Server Error" page hides the actual stack trace. Two
places to find it on cPanel:

- **cPanel → Setup Node.js App → your app → "Show additional info"**, or
  the log path shown there (often `~/nodejs_apps/<app>/logs` or similar).
- **cPanel → Metrics → Errors**, or `~/logs/<domain>.error.log` via File
  Manager/SSH — this is Apache/Passenger's own error log and usually shows
  the Node stack trace for a 500.

If you hit another 500 after following this guide, that log is the thing
to paste back for diagnosis — guessing further from the outside isn't
productive.

---

## Part 2 — Set up the Node.js app in cPanel

1. **cPanel → Setup Node.js App → Create Application**
   - Node.js version: **20.x** (project's `engines.node` requires ≥20.9;
     match whatever LTS your host offers closest to this)
   - Application mode: `Production`
   - Application root: e.g. `nigeria-lex` (a folder *outside* `public_html`
     is fine and preferred — Passenger proxies to it)
   - Application URL: your domain / subdomain
   - Application startup file: `server.js` (this is Next's standalone
     entry point — created by the build, see Part 3)

2. Don't click "Run NPM Install" yet — do that from the terminal in Part 3
   so you can watch it for native-module compile errors.

---

## Part 3 — Get the code onto the server and build there

**Upload source, not build output.** Either `git clone` your repo directly
on the server (SSH, if your plan has it) or upload the project as a zip
**excluding** `node_modules` and `.next`, then unzip in place.

From cPanel's **Terminal** (or SSH), inside the application root, with the
Node version selected in step 2 active (cPanel's Node.js app screen gives
you an "Enter to the virtual environment" command — run that first so
`node`/`npm` on the PATH are the right version):

```bash
cd ~/nigeria-lex          # your application root
npm install               # compiles sharp / @libsql/client for THIS server
npm run generate:importmap   # regenerates src/app/(payload)/admin/importMap.js
```

> **This step matters.** `importMap.js` is an auto-generated file that
> previously contained a hard import from `@payloadcms/storage-s3/client`
> (left over from the old S3 setup). That package is no longer a
> dependency at all, so that specific import has been removed by hand in
> this update — but if you ever add/remove a storage adapter or Payload
> plugin again in future, re-run `npm run generate:importmap` afterwards,
> or `/admin` will fail to build/load referencing a package that isn't
> installed.


If `npm install` fails with a native-module compile error, your hosting
account may be missing build tools (`python3`, `make`, `g++`). Most cPanel
hosts include these for Node.js apps by default; if not, ask your host's
support to confirm build tools are available for the Node.js Selector, or
consider a host/plan that supports full SSH + build tools (many "Setup
Node.js App" plans do already work out of the box).

### Environment variables

In **cPanel → Setup Node.js App → your app → Environment Variables**, set:

```
PAYLOAD_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
DATABASE_URI=file:./data/nigeria-lex.db
SMTP_HOST=mail.nigerialex.com
SMTP_PORT=465
SMTP_USER=info@nigerialex.com
SMTP_PASS=<that mailbox's webmail password>
EMAIL_FROM="Nigeria Lex <info@nigerialex.com>"
EMAIL_NOTIFY_TO=info@nigerialex.com
```

Mail is sent through the cPanel webmail mailbox for nigerialex.com rather
than a third-party provider (previously Gmail SMTP). `SMTP_HOST`/`SMTP_PORT`
are the common cPanel defaults, but confirm the exact values for your
account under **https://nigerialex.com/webmail → Configure Mail Client**
— some hosts use a server hostname (e.g. `server123.yourhost.com`) instead
of `mail.nigerialex.com`. `SMTP_USER`/`SMTP_PASS` are just that mailbox's
normal webmail login — no app-password step like Gmail required. Keep
`EMAIL_FROM` on the same address as `SMTP_USER`, or mail servers tend to
flag it as spoofing.

(No `S3_*` variables — they're gone. No MySQL variables — see above.)

### Build

Still in the terminal, with those same env vars available to the shell
(cPanel's Node.js app env vars aren't automatically exported to a plain
terminal session — easiest is to `source` a `.env` export or prefix the
build command):

```bash
mkdir -p data                     # SQLite file lives here — keep it out of /public
export $(grep -v '^#' .env | xargs)   # if you've also placed a .env file here
npm run build
```

This produces `.next/standalone/`. Next's standalone output does **not**
automatically include your static assets — copy them in:

```bash
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cp -r data .next/standalone/data          # so the SQLite file travels with server.js
```

Point cPanel's **Application startup file** at
`.next/standalone/server.js`, or move the *contents* of
`.next/standalone/` up to your application root so `server.js` sits
directly there (either works — just be consistent with what you set in
Part 2).

Then **Restart** the app from the Setup Node.js App screen.

### Seed the database

Once the app is running (so `node_modules` and `.env`/env vars are in
place), seed it from the same terminal:

```bash
npm run seed
```

This is safe to re-run — it **updates by slug** rather than duplicating
content (see `src/seed/runSeed.ts`). It writes the real starting content
for Home/About/Research/Pilot pages, the six placeholder Legal pages
(clearly marked "draft — pending legal review"), the two Intelligence
sample entries, one sample Event, and a hidden demo Firm/Lawyer pair
(status `pilot_2026`, never shown publicly). It does **not** touch
Firms/Lawyers beyond that one demo pair, Subscribers, or Contact Messages
— those come from real usage/admin entry.

After seeding, log in at `/admin`. There is no default admin user created
automatically — Payload's first-run flow prompts you to create one the
first time you visit `/admin` on an empty `users` collection.

> **A note on the two sample Intelligence entries** ("Welcome to Nigeria
> Lex" / "Nigeria Lex Announces Pilot Study 2026"): the live `/intelligence`
> page has been changed to show the pilot holding message instead of a
> list, regardless of what's in the collection (see Part 4), so these two
> seeded entries won't display publicly by default. Un-publish or delete
> them in `/admin` if you'd rather they not exist at all; harmless either
> way.

---

## Part 4 — What changed in the code (recap)

- `src/app/(payload)/admin/importMap.js` — removed a stale import of
  `@payloadcms/storage-s3/client` left over from the old S3 setup. This
  file is regenerated by Payload, but since that package is no longer a
  dependency at all, the import in the uploaded build would fail to
  resolve — a very plausible contributor to `/admin` 500ing specifically,
  since none of the other affected pages touched that package.
- `src/payload.config.ts` — `postgresAdapter` → `sqliteAdapter`; the
  `s3Storage` plugin removed entirely (Payload defaults to local disk once
  no storage plugin is registered).
- `src/collections/Media.ts` — uploads now write to `/public/media`,
  served by Next.js directly at `/media/<filename>`.
- `package.json` — `@payloadcms/db-postgres` → `@payloadcms/db-sqlite`;
  `@payloadcms/storage-s3` removed.
- `.env.example` — updated for the above; no `S3_*` vars.
- `src/app/(site)/intelligence/page.tsx` — replaced the article list with
  the Pilot 2026 holding message when there's nothing to show, added the
  **Earlier Research & Publications** archive section (the two NISM PDFs,
  now at `public/research/`), kept the category filter chips visible but
  inert.
- `src/app/(site)/intelligence/[slug]/page.tsx` — wrapped the data fetch
  in the same try/catch pattern used everywhere else on the public site,
  so a transient DB hiccup 404s instead of 500ing; guarded rendering
  against missing rich-text content.
- `src/globals/AboutContent.ts` — the CMS field label for the "Strategic
  Research and Intelligence Partner" section now matches what's shown on
  the public About page (it previously auto-labelled as "Research Partner
  Text" in `/admin` only — the public page copy was already correct).
- `src/components/HomeHeroGallery.tsx` — auto-advances every 5 seconds
  (pauses permanently once a visitor manually uses the arrows/dots/swipe,
  and never auto-plays for visitors who have "reduce motion" set), plus
  two additional Lagos photos.

---

## Alternative: using cPanel Postgres

If WHM confirms your account has a **PostgreSQL** service (not MySQL) —
check cPanel's dashboard for a "PostgreSQL Databases" icon distinct from
"MySQL Databases" — you can skip SQLite entirely:

1. `npm install @payloadcms/db-postgres` (and `npm uninstall
   @payloadcms/db-sqlite`)
2. In `src/payload.config.ts`, swap the adapter back:
   ```ts
   import { postgresAdapter } from '@payloadcms/db-postgres'
   // ...
   db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } }),
   ```
3. Create a Postgres database + user in cPanel, and set `DATABASE_URI` to
   `postgresql://<user>:<password>@localhost:5432/<database>`.

Media storage stays on local disk either way — that part of the change
isn't tied to which database you use.
