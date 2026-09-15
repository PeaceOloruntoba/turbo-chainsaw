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

### Homepage Lagos photo — cleaner photo, no on-page credit, swipeable
Your voice note didn't come through as text I could read (no audio
transcription available on my end), so this is built from your typed
points:

1. **Cleaner photo, no visible credit line.** The old photo (by Nupo Deyon
   Daniel) had a caption directly under it on the page reading "Photo:
   Nupo Deyon Daniel / Unsplash" — that's gone, and it's replaced with three
   different clean, corporate/infrastructure shots of Lagos (Lekki-Ikoyi
   Link Bridge and an aerial skyline view, from other Unsplash
   photographers), matching the same "no gavels/handshakes, corporate and
   architectural" visual language used for the other page heroes. None of
   these need attribution — Unsplash's license doesn't require it, so
   there's no caption line at all now, not even a different name.
2. **Scrollable page-to-page.** New `HomeHeroGallery.tsx` replaces the
   single static photo with a small swipeable gallery — native
   scroll-snap, so it swipes on touch, drags on trackpad, and also has
   visible left/right arrows plus dot indicators for anyone on a mouse.
   One photo fills the frame at a time, "scrolling from page to page"
   exactly as asked.
3. **Clifford Chance reference.** Their homepage uses the same underlying
   idea — a rotating set of full-bleed banner images at the top of the
   page. I've kept Nigeria Lex's restrained card-in-hero treatment (per
   the "no redesign" direction from the first round) rather than adopting
   Clifford Chance's full-bleed edge-to-edge banner style, since that
   would be a more significant visual change — let me know if you actually
   want the full-bleed treatment instead and I'll adjust.

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
