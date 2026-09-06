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

5. Visit `http://localhost:3000` to see the public site. Pages that read
   from collections (Home's "Latest Intelligence", Firms & Lawyers,
   Intelligence, Events) render sensible empty states until you publish
   content — nothing needs to be seeded before the site works.

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
- **Change the pilot timetable / ordinary page text** → the Pilot 2026,
  About, Research, and Contact page copy currently lives in the page files
  themselves (`src/app/(site)/.../page.tsx`) rather than the CMS, since Phase
  1 prioritised a fast, credible launch. Wiring this copy into an editable
  Payload global is a natural, low-risk Phase 2 addition — flag it if you'd
  like it prioritised.
- **View subscriber enquiries** → Subscribers collection (newsletter
  sign-ups) and Research Submissions collection (firm/institutional
  submissions)

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

## What's intentionally deferred to later phases

- **Firms & Lawyers filtering UI** (by Firm/Lawyer/Practice Area/Sector/
  Location) — the schema fully supports it (see `Firms.ts`, `Lawyers.ts`);
  the filter controls are shown but inert until there's enough published
  research to filter meaningfully (per brief §8).
- **Subscriber-only access control for Intelligence** — the `isSubscriberOnly`
  flag and gating UI exist now; enforcing it against a real subscriber
  session/login (Phase 4, "Future Subscription Capability") is not built yet.
- Real legal copy for Privacy Policy, Cookie Policy, Terms of Use,
  Disclaimer, Editorial Independence and Corrections Policy — these are
  stubbed with a placeholder notice pending legal review, since the brief
  did not supply final text and this is not something to draft unreviewed.
