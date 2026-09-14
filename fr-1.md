# Nigeria Lex — Feedback Resolution (Round 1)

This document tracks the 18 items from the client's review email against what
has been changed in the codebase. It is a delivery manifest, not part of the
live site — drop the files below into the matching paths in the repo and the
changes are live.

**How to apply:** every file in this folder mirrors its path in the repo
(e.g. `src/components/Header.tsx` here → `src/components/Header.tsx` in the
project). Copy each file over the existing one at the same path. Nothing
needs to be merged by hand.

**Important — re-run the seed script after deploying.** Several of these
changes are default/fallback copy that lives in two places: the Payload
global config (what a fresh database gets) and `src/seed/runSeed.ts` (which
*overwrites* the live database with authoritative content when run). If the
site's database has already been seeded once, the old copy is sitting in the
database and the code fallbacks won't be shown. Run `npm run seed` (or hit
`/api/seed?secret=...`) after deploying these changes so the new strapline,
homepage hero, About page and Pilot 2026 copy actually appear on the live
site. This is safe to re-run — it updates existing documents by slug rather
than duplicating them.

---

## Status summary

| # | Item | Status |
|---|------|--------|
| 1 | Strapline replacement, site-wide | ✅ Fixed |
| 2 | Homepage principal proposition | ✅ Fixed |
| 3 | About — "Who We Are" opening paragraph | ✅ Fixed |
| 4 | About — Leadership section | ✅ Fixed (structure already correct; copy updated) |
| 5 | About — Ownership wording | ✅ Fixed |
| 6 | About — SBM Intelligence heading & copy | ✅ Fixed |
| 7 | Firms & Lawyers — research-in-progress notice | ✅ Fixed |
| 8 | Research page methodology — retain as-is | ✅ No change made (confirmed as requested) |
| 9 | Research participation form — expanded routes | ✅ Fixed |
| 10 | Pilot 2026 — institutional-user positioning & flow | ✅ Fixed |
| 11 | Hero imagery — lighter overlay, varied images | ✅ Fixed |
| 12 | Header logo legibility | ✅ Fixed |
| 13 | Mobile optimisation | ⚠️ Audited — largely already compliant, see notes |
| 14 | Intelligence filters | ⚠️ Audited — already compliant, see notes |
| 15 | Subscribe functionality | ✅ Fixed (form/fields already matched spec; confirmation + consent wording updated) |
| 16 | Test all forms end-to-end | ⚠️ Needs a live QA pass — see notes |
| 17 | Footer — legal/editorial links | ✅ Fixed |
| 18 | Overall design direction | ✅ No redesign made (confirmed as requested) |

---

## Item-by-item detail

### 1. Strapline
Replaced "Legal Market Intelligence for Informed Decisions" with
"Independent research. Market intelligence. Informed choice." everywhere it
appeared in the codebase: the Site Settings default (admin-editable), the
Footer fallback, the `<title>` metadata on every page, the seed data, and
(for completeness) `README.md` and `package.json`'s description field. The
homepage `<head>` JSON-LD `slogan` already had the new wording — nothing to
do there.

Note: since `strapline` is an editable Payload field, if the live database
already has the old value saved, re-running the seed script (see above) or
editing it once in `/admin → Site Settings` will update it.

Files: `src/globals/SiteSettings.ts`, `src/components/Footer.tsx`,
`src/app/(site)/layout.tsx`, `src/seed/runSeed.ts`, `README.md`,
`package.json`

### 2. Homepage — sharpened proposition
Hero headline changed to "Independent intelligence on Nigeria's corporate
legal market.", hero body to the requested paragraph. Primary CTA unchanged
("Explore Our Research" → `/research`). Secondary CTA relabelled "Our
Methodology" and repointed to `/research#methodology` (the existing anchor
on the Research page's methodology section).

Files: `src/globals/HomeContent.ts`, `src/app/(site)/page.tsx`,
`src/seed/runSeed.ts`

### 3–6. About page
- **Who We Are**: the requested sentence is now the opening paragraph,
  followed by the existing explanatory copy.
- **Leadership**: the section already existed in the codebase, already
  correctly positioned after "Who We Are"/"Our Purpose" and before
  "Ownership" — no structural change was needed. Updated Paul Onifade's
  biography to the exact wording provided. No photograph added, as
  instructed.
- **Ownership**: "promoted and published" → "owned and published". Heading
  unchanged.
- **SBM Intelligence**: heading changed from "Research Partner" to
  "Strategic Research & Intelligence Partner"; paragraph replaced with the
  wording provided, making the Nigeria Lex / Kaye & Crowther / SBM
  Intelligence hierarchy explicit.

Files: `src/globals/AboutContent.ts`, `src/app/(site)/about/page.tsx`,
`src/seed/runSeed.ts`

### 7. Firms & Lawyers page
Hero retained (eyebrow "Firms & Lawyers", H1 "Firms & Lawyers", description
"A structured view of capability, experience, sectors and practice areas.").
Added a permanent notice immediately below the hero, before the
filter/database area, with the exact copy requested and a "Participate in
Research" button linking to the Law Firms participation form on the Pilot
2026 page (`/pilot-2026#law-firms-participate`). Simplified the old
zero-results placeholder further down so it no longer duplicates the new
notice. This notice is clearly commented in the code as removable once the
firm/lawyer database goes live.

File: `src/app/(site)/firms/page.tsx`

### 8. Research page methodology
No changes made to "Evidence before reputation", "Our Methodology", "How We
Research", "What We Assess", "Research Process", "Research Independence" or
"Corrections and Review" — confirmed these should stay as-is per the brief.
(One small addition for item 17 below: an `id="independence"` anchor was
added to the Research Independence section so the footer can link straight
to it, exactly as it already does for Research Methodology. No visible or
textual change.)

### 9. Research participation form
The submission-type dropdown (shared by the Research page and both Pilot
2026 forms) now offers all six routes requested:
- Law firm — participate in research
- Corporate / General Counsel — contribute market feedback
- Investor / Financial Institution — contribute market insight
- Professional Adviser — contribute market insight
- Other Institutional Participant
- General Research Enquiry

The form now adapts to the selected category: law firms see "Relevant
practice area(s) or sector" and "Submission information"; the four
institutional routes see an added "Role" field, "Sector", "Nature of
contribution", and a "Nigeria Lex may contact me confidentially for research
purposes" checkbox; the general-enquiry route shows a plain message field
plus a note steering research/institutional enquiries back to the specific
categories. Immediately above the submit button, the required
Privacy-Policy/confidentiality notice is now shown, with "Privacy Policy"
linked to `/legal/privacy-policy`.

The underlying `research-submissions` collection has matching new fields
(`role`, `mayContactConfidentially`) and the expanded `submissionType`
options (the old `institutional` value is kept, marked legacy, purely so any
submissions already collected under it stay readable in `/admin`).

Files: `src/collections/ResearchSubmissions.ts`,
`src/components/ResearchSubmissionForm.tsx`

### 10. Pilot 2026 page
Restructured to the requested flow. Immediately below the intro (which now
opens with the exact paragraph provided), three distinct CTA buttons jump to
the relevant sections: "Law Firms — Participate in Research",
"Institutional Users — Contribute", and "Register for Pilot Updates". The
body now runs: What Is Being Researched → Why It Matters → Who Can
Participate → Timetable → Proposed Lagos Presentation → How to Engage, with
the two submission forms and the subscribe form beneath. The Lagos
presentation is called out in its own section and consistently described as
"proposed" pending confirmation of date/venue.

Files: `src/globals/Pilot2026Content.ts`, `src/app/(site)/pilot-2026/page.tsx`,
`src/seed/runSeed.ts`

### 11. Hero imagery
The shared `PageIntro` component (used by About, Research, Intelligence and
Firms & Lawyers) already used four distinct — but visually related —
Unsplash images (no repeated image across sections, no gavels/scales/
handshakes). Darkened the navy overlay from 45% to 32% opacity and raised
the underlying photo's opacity from 55% to 68% (a ~24% visibility increase),
which is within the 15–25% range requested, while the overlay plus the
existing luminosity blend still keep the white hero text legible.

File: `src/components/PageIntro.tsx`

### 12. Header/logo
The previous header rendered a single flattened image containing both the
"NL" monogram and the "NIGERIA LEX" wordmark stacked on top of each other —
at the header's fixed height, the wordmark portion of that image was only a
few pixels tall, which is why it read as illegible regardless of the overall
logo size. Replaced it with the existing NL monogram image plus a real text
wordmark set beside it, so the wordmark's size is no longer tied to the
image's internal proportions. This makes "NIGERIA LEX" clearly legible at a
modest size without increasing the header's height. If a custom full-lockup
image is later uploaded via Site Settings, the header falls back to
rendering that image as a single unit (as before), since we can't assume
its internal composition.

File: `src/components/Header.tsx`

### 13. Mobile optimisation
Audited each specific point in the brief against the existing responsive
Tailwind classes (breakpoints: `sm` 640px, `md` 768px, `lg` 1024px):

- **Main nav collapses without horizontal scroll**: the full desktop nav and
  the "Subscribe" button are both `hidden` below `lg`; only the logo and
  hamburger show, so there's nothing to overflow. Confirmed, no change
  needed.
- **What We Assess → single column on mobile**: this grid was already
  `grid-cols-1` by default with `sm:grid-cols-2` only applying at ≥640px —
  i.e. it was already single-column on phone-width viewports. Confirmed, no
  change needed.
- **Five-stage Research Process readable**: uses a simple flex row per step
  (number + text), which reflows naturally; no grid to break. Confirmed.
- **Research form fields/dropdowns use full mobile width**: all paired
  fields use `sm:grid-cols-2` (single column below 640px, i.e. full width on
  phones); this also applies to the newly added Role field and dropdown.
  Confirmed.
- **Intelligence filters wrap cleanly**: `flex flex-wrap` already in place.
  Confirmed, no change needed (see item 14 below).
- **Footer stacks logically**: three-column grid collapses to one column
  below `md` (768px). Confirmed, no change needed.
- **Subscribe/Contact/Research forms easy on phone**: all use the same
  responsive single/two-column field pattern described above.

No code changes were required for this item beyond what items 7–12 and 17
already touch (which were re-checked for the same responsive behaviour).
**This was a code-level audit, not a substitute for an actual on-device
pass** — please still spot-check on a real iPhone and Android handset
before directing external stakeholders to the site, particularly the two
Research-participation forms with their new fields.

### 14. Intelligence page
The category filter pills already use `flex flex-wrap`, so they wrap onto
additional lines rather than overflowing horizontally, and the list of
categories is just a plain array — adding more categories later doesn't
require any layout change. The seven classifications (Article, Report,
Briefing, Sector Briefing, Transaction Intelligence, Regulatory Intelligence,
Investor Briefing) are unchanged, as requested. No code changes made — this
was confirmed already compliant.

### 15. Subscribe functionality
The Subscribe form (linked from the header's "Subscribe" button) already
collected First name, Surname, Organisation, Job title, Email, Country and
Areas of interest, with a required consent checkbox and an `unsubscribed`
flag on the underlying record — no field changes were needed. Updated the
consent text to explicitly reference and link to the Privacy Policy, and
changed the post-submission confirmation to read "Thank you for subscribing
to Nigeria Lex." as requested.

On storage/access: subscribers are written to the `subscribers` collection
in Payload, readable only by logged-in Nigeria Lex/K&C staff accounts (see
item 16 below for how to confirm this end-to-end).

File: `src/components/SubscribeForm.tsx`

### 16. Test all forms end-to-end
This is confirmed correct at the code level but **needs to be exercised
against the live deployed instance**, which isn't something achievable from
a static code review:

- All three forms (Subscribe, Research → Participate, Contact) — Contact is
  informational/mailto-based and doesn't submit anywhere; Subscribe and
  Research submissions both POST to Payload's auto-generated REST endpoints
  (`/api/subscribers`, `/api/research-submissions`) for the `subscribers`
  and `research-submissions` collections respectively.
- **Where data is stored**: whichever database `DATABASE_URI` in the
  deployed environment points to (see `docker-compose.yml`/`.env`) — this is
  a hosting/infrastructure setting, not something fixed in this codebase.
- **Who has access**: both collections restrict `read` to logged-in Payload
  users (`/admin`); `create` is public (that's how the public forms work),
  `delete` is admin-role only.
- **K&C/Nigeria Lex control of admin accounts**: the `users` collection uses
  Payload's standard auth with no hardcoded or developer-specific account —
  whoever creates the first admin user (or is added via `/admin`) controls
  access. Please confirm as part of deployment that the admin account(s) in
  the live instance belong to K&C/Nigeria Lex staff, and that `DATABASE_URI`
  points to infrastructure you control (not a developer's personal
  database), since that's a hosting decision outside this codebase.
- **Backups**: dependent on which database host is used in production —
  please confirm this against whatever's configured for the live deployment.

Recommended before directing stakeholders to the site: submit a real test
entry through each of the Subscribe form and both Research-participation
forms (law firm and institutional) on the live site, and confirm each one
appears in `/admin`.

### 17. Footer — legal and editorial links
All seven links are now present: Privacy Policy, Cookie Policy, Terms of
Use, Disclaimer, Research Methodology, Editorial Independence, Corrections
Policy (plus Contact, which was already there). Research Methodology already
linked to `/research#methodology`; Editorial Independence now links the same
way, to `/research#independence` (a new anchor added to the existing
"Research Independence" section), rather than to the separate
`/legal/editorial-independence` page — matching how Research Methodology is
handled. That standalone legal page still exists (for direct linking/SEO)
but the footer no longer points to it. Corrections Policy already had a
stable dedicated page at `/legal/corrections-policy`, seeded with the
substance of the "Corrections and Review" text — reordered in the footer to
sit after Editorial Independence per the requested order.

Files: `src/components/Footer.tsx`, `src/app/(site)/research/page.tsx`

### 18. Overall design direction
No redesign made. Typography, navy/institutional-green palette, whitespace
and overall editorial register are untouched — every change above is
copy/content, form/field, link-target or contrast-level, not a visual
system change.

---

## Full list of changed files

```
README.md
package.json
src/globals/SiteSettings.ts
src/globals/HomeContent.ts
src/globals/AboutContent.ts
src/globals/Pilot2026Content.ts
src/collections/ResearchSubmissions.ts
src/components/Footer.tsx
src/components/Header.tsx
src/components/PageIntro.tsx
src/components/ResearchSubmissionForm.tsx
src/components/SubscribeForm.tsx
src/app/(site)/layout.tsx
src/app/(site)/page.tsx
src/app/(site)/about/page.tsx
src/app/(site)/firms/page.tsx
src/app/(site)/pilot-2026/page.tsx
src/app/(site)/research/page.tsx
src/seed/runSeed.ts
```

Each file above sits at the same relative path in this delivery folder as it
does in the repo — copy over the existing files at those paths.

## Suggested next steps
1. Copy the files above into the repo at matching paths.
2. `npm run seed` (or `/api/seed?secret=...`) against the target database so
   the new copy replaces anything already seeded.
3. `npm run build` to confirm a clean production build.
4. Live QA pass per items 13 and 16 above — mobile devices and an
   end-to-end form submission test.
5. Send back for final review.
