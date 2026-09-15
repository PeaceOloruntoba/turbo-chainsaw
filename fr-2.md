# Nigeria Lex — Round 2 (email, unsubscribe, contact form, favicon, mobile fix, homepage photo)

Covers items 1, 2, 3 and 6 from the "not yet implemented" list, the mobile
header-overflow bug spotted in the screenshot, and the homepage Lagos photo
feedback (cleaner photo, no on-page credit, swipeable gallery). Not deployed
yet, so this is one combined round — apply all of it together.

**How to apply:** copy each file over the existing one at the same path.

---

## What changed

### 1. Email notifications (Nodemailer + Gmail SMTP)
New `src/lib/email.ts` sends via Gmail SMTP. Wired into three collections'
`afterChange` hooks, firing only on create:

| Event | Confirmation email to submitter | Staff alert to `EMAIL_NOTIFY_TO` |
|---|---|---|
| New subscriber | ✅ "Thank you for subscribing to Nigeria Lex" + unsubscribe link | ✅ |
| New research/Pilot 2026 submission | ✅ "Submission received" | ✅ |
| New contact message | ✅ "Message received" | ✅ |

If SMTP isn't configured, sends are skipped and logged to the console rather
than failing the request — a broken email setup can never block someone
from subscribing or submitting.

**Setup required on your end (I can't do this part):**
1. In the Gmail account you want to send from: enable 2-Step Verification,
   then generate an **App Password** at
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   Use that (not the normal Gmail password) as `SMTP_PASS`.
2. Add to `.env` (see the updated `.env.example` for the full block with
   comments):
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your-sending-address@gmail.com
   SMTP_PASS=your-16-character-app-password
   EMAIL_FROM="Nigeria Lex <your-sending-address@gmail.com>"
   EMAIL_NOTIFY_TO=info@nigerialex.com
   ```
3. `EMAIL_NOTIFY_TO` is the "which inbox gets staff alerts" setting —
   change it any time without touching code.
4. Run `npm install` — `nodemailer` was added to `package.json`.

### 2. Self-service unsubscribe
- `Subscribers.ts`: new `unsubscribeToken` field, auto-generated on create.
- New page `/unsubscribe?token=...` flips the subscriber to unsubscribed
  and shows a confirmation (or a graceful "link not recognised" message).
- The subscriber confirmation email includes this link.

### 3. Real Contact form
- New `ContactMessages` collection (name, email, organisation, optional
  department — mirrors the same five departments already listed on the
  Contact page, as requested), registered in `payload.config.ts`.
- New `ContactForm.tsx`, added to the Contact page **under a new "Send a
  message" section**, above the existing "Correspondence" section — the
  existing mailto department links are untouched, exactly as agreed.

### 6. Favicon wiring
- `layout.tsx`'s metadata is now generated dynamically (`generateMetadata`)
  and reads Site Settings' `favicon` upload. If one's uploaded, it's used
  site-wide; if not, it falls back to the existing `src/app/icon.png` file
  exactly as before. Updated the field's admin description to match.

### Mobile header overflow fix (regression from the last round)
The "NIGERIA LEX" wordmark text next to the logo mark was set to
`whitespace-nowrap` at every screen size. On narrow phones, the mark image +
that fixed-width text together didn't fit in the header row — and because
the header is global, this dragged the *entire site* into horizontal
scroll (matches your screenshot: every line of text on the page, not just
the header, was cropped on the left).

Fixed in `Header.tsx`:
- Wordmark now shrinks (smaller size/tracking) below the `sm` breakpoint
  and `truncate`s instead of forcing overflow if it's ever still tight.
- Logo mark image is slightly smaller on mobile, full size from `sm` up.
- The header row's `min-w-0` + reduced gap let things actually shrink
  instead of being held to their content width.

Also added a **global safety net** in `globals.css` (`overflow-x: hidden`
on `html`/`body`) so that if any future element does this again, the page
clips it instead of scrolling sideways. There's no intentional
horizontal-scroll UI anywhere in the site, so this has no downside.

### Homepage Lagos photo — full-bleed hero background, industrial imagery, swipeable
Your voice note didn't come through as text I could read (no audio
transcription available on my end), so this is built from your typed
points, including the follow-up asking for the photo to be the entire hero
background (Clifford Chance-style) with the grid pattern and a backdrop
kept on top so the text stays legible:

1. **Cleaner photos, no visible credit line, more industrial character.**
   The old single photo (by Nupo Deyon Daniel) had an on-page caption
   reading "Photo: Nupo Deyon Daniel / Unsplash" — gone. Replaced with four
   different clean Lagos shots with more of an industrial/infrastructure
   feel — the Lekki-Ikoyi Link Bridge, boats beside a modern bridge, an
   aerial skyline, and a black-and-white bridge shot for variety — all from
   other Unsplash photographers (Malik Buraimoh, Namnso Ukpanah, Tunde
   Buremo). None need attribution — Unsplash's license doesn't require
   it — so there's no credit line at all now.
2. **Full-bleed hero background, not a side card.** Rebuilt
   `HomeHeroGallery.tsx` to render as the entire hero section's background
   rather than a photo card next to the text. On top of the photos: the
   same grid-line pattern used elsewhere on the site (added as a new
   `.hero-grid-overlay` CSS class — same grid lines as the existing
   `.hero-grid`, just without its solid navy fill, so it can sit over a
   photo instead of replacing one), then a navy tint for contrast, then the
   headline/body/buttons on top of that — same layered approach as Clifford
   Chance's banner, in Nigeria Lex's own restrained palette rather than
   copying their visual style.
3. **Still swipeable, page to page.** Same scroll-snap behaviour as before
   — swipe/drag through the four photos, plus visible arrows and dot
   indicators for mouse users — just now filling the whole hero instead of
   a small card.
4. Removed the old two-column hero layout (text | photo card) and the
   decorative "Signal / 01" badge and green accent bar that were styled
   specifically for that card — they didn't have anywhere sensible to sit
   once the photo became the full background. Let me know if you'd like a
   similar small badge/motif reintroduced somewhere in the new layout.

---

## ⚠️ Database schema changes — expect another interactive prompt

Two schema-affecting changes are in this round:
- `subscribers` gets one new column: `unsubscribe_token`.
- A brand-new table: `contact_messages`.

Same as last time: **fully restart `npm run dev`** after pulling these
files (don't just refresh the browser), and watch the terminal. You'll
likely see one prompt:

```
Is unsubscribe_token column in subscribers table created or renamed from another column?
❯ + unsubscribe_token   create column
  ...
```
→ choose **`create column`** (it's genuinely new, not a rename of anything).

The new `contact_messages` table should just be created automatically
without a prompt, since there's nothing ambiguous for drizzle to ask about
on a brand new table.

No seed changes were needed for this round — nothing here has default/seed
copy, so there's no need to re-run `npm run seed` unless you want to for
other reasons.

---

## Testing checklist
1. Restart dev server, confirm no schema prompts are left pending.
2. Submit the Subscribe form with a real email you can check — confirm
   you receive the confirmation email, and that `info@nigerialex.com` (or
   whatever `EMAIL_NOTIFY_TO` is set to) gets the staff alert.
3. Click the unsubscribe link in that email — confirm it flips the
   subscriber and shows the confirmation page.
4. Submit both a Research/Pilot 2026 form and the new Contact form —
   confirm both confirmation + staff alert emails arrive.
5. Check the site on a narrow phone (or Chrome DevTools at ~360–390px) —
   confirm no horizontal scroll on Research, Intelligence, Pilot 2026 and
   generally.
6. If you uploaded a favicon in Site Settings, hard-refresh a page and
   check the browser tab icon updated.
7. On the homepage, confirm the new Lagos photo gallery swipes cleanly on
   a phone and via the arrow buttons on desktop, and that there's no
   photo-credit text under it anymore.

## Full list of changed/new files
```
src/lib/email.ts                          (new)
src/collections/ContactMessages.ts        (new)
src/components/ContactForm.tsx            (new)
src/app/(site)/unsubscribe/page.tsx       (new)
src/components/HomeHeroGallery.tsx        (new)
src/collections/Subscribers.ts
src/collections/ResearchSubmissions.ts
src/app/(site)/contact/page.tsx
src/app/(site)/page.tsx
src/payload.config.ts
src/globals/SiteSettings.ts
src/app/(site)/layout.tsx
src/components/Header.tsx
src/app/(site)/globals.css
package.json
.env.example
```
