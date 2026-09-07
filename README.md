# Nigeria Lex™

Legal Market Intelligence for Informed Decisions — Phase 1.

An independent, research-led legal market intelligence platform for Nigeria's
corporate legal market, built as a single Next.js 15 codebase with Payload
CMS v3 embedded natively.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript, React Server Components)
- **CMS & API:** Payload CMS v3, embedded at `src/app/(payload)`
- **Database:** Supabase Postgres via `@payloadcms/db-postgres` (direct connection — Supabase Auth/Edge Functions are not used)
- **Auth:** Payload's built-in HTTP-only cookie JWT auth (staff accounts only — see `src/collections/Users.ts`)
- **Rich text:** `@payloadcms/richtext-lexical`
- **Media/PDF storage:** `@payloadcms/storage-s3`
- **Styling:** Tailwind CSS, design tokens in `tailwind.config.ts`

## Project structure

```
src/
  app/
    (payload)/          Payload admin panel + REST/GraphQL API routes
    (site)/              Public-facing pages (Home, About, Research, ...)
  collections/           Payload collection schemas
  components/            Shared site components (Header, Footer, forms, ...)
  lib/                   Shared helpers (Payload Local API client)
  payload.config.ts       Main Payload configuration
```

Public routes: `/`, `/about`, `/research`, `/firms`, `/firms/[slug]`,
`/intelligence`, `/intelligence/[slug]`, `/pilot-2026`, `/events`,
`/subscribe`, `/contact`, plus stub legal pages under `/legal/*`.

Admin panel: `/admin`.

## Placeholder logo

No final logo has been supplied yet. `public/logo-lockup.svg` and
`public/logo-mark.svg` are simple placeholder marks (navy field, green arc
accent, "NL" monogram) in the brief's colour palette, used automatically
until a real logo is uploaded. Once you have the approved Logo No. 2, upload
it in `/admin` under **Site Configuration → Site Settings → Logo** — the
header and footer pick it up immediately, no code change needed.

## Local development

**Requirements:** Node 18.20.2+, a Postgres database (Supabase or local), and
(optionally, for uploads) an S3-compatible bucket.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in real values:

   ```bash
   cp .env.example .env
   ```

   - `PAYLOAD_SECRET` — generate with `openssl rand -base64 32`
   - `DATABASE_URI` — your Supabase Postgres **direct** connection string
   - `S3_*` — your media bucket credentials (can be left blank while you're
     only working on layout/content, but uploads won't work until set)

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000/admin` and follow the prompt to create the
   first administrator account. This is the only account with `role: admin`
   until you promote others from the admin panel.

5. Seed placeholder content (recommended — see below):

   ```bash
   npm run seed
   ```

6. Visit `http://localhost:3000` to see the public site. Pages that read
   from collections (Home's "Latest Intelligence", Firms & Lawyers,
   Intelligence, Events) render sensible empty states until you publish
   content — nothing needs to be seeded before the site works, but running
   the seed script gives every page and legal document real starting
   content to edit rather than blank forms.

### What `npm run seed` does

- Creates all six Legal Pages (Privacy Policy, Cookie Policy, Terms of Use,
  Disclaimer, Editorial Independence, Corrections Policy) with generic
  placeholder wording, each flagged **"Draft placeholder — not reviewed"**.
  A matching notice banner shows on the public page until you change a
  page's status to "Final" in `/admin`. This text is a starting point only
  and must be reviewed by Nigeria Lex's legal counsel before launch.
- Persists the default copy for every content Global (Site Settings, Home,
  About, Research, Pilot 2026) as real, editable documents in `/admin`,
  rather than leaving editors looking at blank forms the first time they
  open one.
- Safe to re-run — it updates existing documents by slug instead of
  duplicating them.

## Content editing (non-technical admin)

Everything an editor needs is in the `/admin` panel:

- **Publish an article / report / briefing** → Intelligence collection
- **Add an event** → Events collection
- **Add/update a firm** → Firms collection (set `Research Status` to
  "Published" to make a profile public; leave as "Pilot 2026" to keep it
  research-in-progress and hidden from the public site)
- **Add/update a lawyer** → Lawyers collection
- **Upload a PDF** → attach directly on the relevant Intelligence item, or
  upload independently via the Media collection
- **Change the pilot timetable, hero copy, About text, Research methodology,
  or footer/contact details** → all editable under **Site Configuration**
  and **Page Content** in `/admin` (Site Settings, Home Content, About
  Content, Research Content, Pilot 2026 Content globals) — no code changes
  needed.
- **Edit legal pages** (Privacy Policy, Terms of Use, etc.) → Legal Pages
  collection. Each page has a "Draft placeholder" / "Final" status; set it to
  Final once legal counsel has reviewed the text to remove the draft notice
  from the public page.
- **Change the logo** → Site Settings → Logo (see "Placeholder logo" above)
- **View subscriber enquiries** → Subscribers collection (newsletter
  sign-ups) and Research Submissions collection (firm/institutional
  submissions)

Everything above is now genuinely CMS-driven: once the real logo and final
copy are ready, they go in through `/admin` — no developer required.

## Deployment

### Option 1 — Vercel (Phase 1 testing)

1. Push this repository to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add the environment variables from `.env.example` in the Vercel project
   settings.
3. Deploy. Vercel builds `next build` automatically; no extra config needed
   beyond the env vars.

Note: Payload's admin panel and file uploads work on Vercel, but for anything
beyond light testing, prefer S3 (not local disk) for media — which is
already how this project is configured.

### Option 2 — VPS via Docker + Nginx (production)

1. On the VPS, clone the repo and create `.env` from `.env.example` with
   production values (including a production `NEXT_PUBLIC_SERVER_URL`).
2. Update `nginx/nginx.conf` with your real domain in place of
   `nigerialex.com`.
3. Obtain a first certificate (before Nginx can serve HTTPS), e.g.:

   ```bash
   docker compose run --rm certbot certonly \
     --webroot -w /var/www/certbot \
     -d nigerialex.com -d www.nigerialex.com
   ```

4. Build and start everything:

   ```bash
   docker compose up -d --build
   ```

   This runs three containers: `app` (Next.js + Payload, built via the
   included multi-stage `Dockerfile`), `nginx` (reverse proxy + TLS
   termination), and `certbot` (automatic certificate renewal).

5. Point your domain's DNS A/AAAA records at the VPS if you haven't already.

## Ownership & accounts

Per the design brief, the domain, hosting account, Supabase project, S3
bucket, and admin credentials should be registered under Kaye & Crowther
Limited / Nigeria Lex accounts, not the developer's personal accounts.

## Phase status

**Phase 1 (Design) and Phase 2 (Initial Website — About, Research,
Intelligence, Pilot, Events, Contact, Subscribe) are complete**, and the CMS
is fully wired: every piece of on-page copy, the logo, contact details, and
all legal pages are editable from `/admin` with no code changes required.
Placeholder content (logo, hero copy, legal text) is in place throughout and
clearly identifiable as placeholder — see "Placeholder logo" above and the
draft-status banner on legal pages.

**Deferred to later phases, per the brief's quotation structure (§19):**

- **Phase 3 — Research Database:** the schema for a searchable, filterable
  Firms & Lawyers database is fully built (`Firms.ts`, `Lawyers.ts`, and the
  individual firm profile page at `/firms/[slug]`), but the public filter
  controls (by Firm/Lawyer/Practice Area/Sector/Location) are shown inert
  until there's enough published research to filter meaningfully, matching
  the brief's "Research in progress" placeholder instruction (§8, §20).
- **Phase 4 — Future Subscription Capability:** the `isSubscriberOnly` flag
  and gating UI on Intelligence items exist now; enforcing that against a
  real subscriber login/paywall is Phase 4 work.
- **Real legal copy:** Legal Pages ship seeded with generic, clearly-marked
  draft placeholder text (see `npm run seed`) so the pages aren't empty —
  but this has not been reviewed by counsel and must be finalised before
  launch.
