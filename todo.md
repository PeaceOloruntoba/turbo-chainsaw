# Nigeria Lex Pilot 2026 — Research Submission Portal
## Recommended technical solution (for approval before any build)

**Status: proposal only. Nothing has been built or changed.** This document answers your ten points, sets out the options, and lists the decisions and inputs I need from Kaye & Crowther (K&C) before starting.

---

## 1. Recommendation in brief

1. **Build the questionnaire inside the Nigeria Lex website** (Option C below), not in Google Forms or another third-party survey tool. It is the only option that gives seamless branding, real save-and-return, a repeatable "+ ADD REPRESENTATIVE MATTER" block, controlled access and full K&C ownership of the data.
2. **Participants get in with an invitation link, then an emailed sign-in link.** No passwords to remember. K&C invites a firm; the firm's named contact receives a personal link; on later visits they enter their email address and receive a fresh one-time sign-in link.
3. **Progress is saved on the Nigeria Lex database, not in the browser.** A firm can stop, close the browser, switch device, and continue where they left off.
4. **A draft is never a submission.** Status changes to *Submitted* only when the firm presses the final Submit button on the Review page. Nigeria Lex staff move it to *Under Review*.
5. **All data sits in a K&C-controlled PostgreSQL database**, with backups, exports and an independent copy that do not depend on the developer or on SBM.
6. **SBM researchers get a separate, limited "Research reviewer" login**, controlled and revocable by K&C, with no administrative or hosting access.
7. **Document uploads are built but switched off**, until K&C has approved the storage, access and security arrangements in section 9.

---

## 2. Form technology: options compared

| | **A. Google Forms** (embedded or linked) | **B. Third-party form builder** (paid, branded) | **C. Built into the Nigeria Lex website** *(recommended)* |
|---|---|---|---|
| Looks and feels like Nigeria Lex | Limited. It is visibly Google, even when embedded | Better with paid plans, but still a vendor's page or frame | **Fully.** It uses the site's own design |
| Save and return later | As far as I know, only for respondents signed in to a Google account, and progress is kept for a limited time | Offered by some paid plans; varies by vendor | **Yes.** Saved on our database, works on any device |
| Repeat "+ Add representative matter" | Not really. It cannot add repeating blocks on demand | Limited or awkward | **Yes.** Unlimited or capped, as you choose |
| Controlled access (invited firms only) | Weak. Anyone with the link can respond | Some plans | **Yes.** Personal links, revocable |
| Who owns the data | The Google account holder (an individual, or possibly SBM) | The vendor's account | **K&C's own database** |
| Independent copy and export | Manual, tied to that account | Vendor export | **Built in** (CSV/Excel, plus scheduled backups) |
| SBM access without handing over control | Sharing the sheet or form is all-or-nothing | Vendor seat model | **Role-based, read-only, revocable** |
| Uploads with proper control | Requires respondents to sign in to Google | Vendor storage | **Our own private storage, access-checked** |
| Data-protection position | Data sits with a US provider | Data sits with a vendor | **One place we control**, and we choose the region |
| Effort and cost | Lowest | Low, plus a monthly fee | **Highest one-off**, no per-response fee |

**Why not A or B:** they can each meet some of your points, but none meets points 1, 2, 4, 5 and 6 together. You also said the system must not depend on one individual's or SBM's account. Options A and B put the data in exactly that kind of account.

Nothing about the website stack is unusual, so a future developer can take it over. The site already uses the same database, roles and audit-log arrangements that Option C builds on.

---

## 3. Controlled participant access: options

| Option | How it works | Pros | Cons |
|---|---|---|---|
| **1. Unique link only** | Each firm gets a personal link; whoever holds the link can open and edit | Simplest; nothing to remember | Anyone the email is forwarded to has access; no proof it is the right person later |
| **2. Username and password** | Firms create accounts | Familiar | Friction; forgotten passwords; another set of credentials to secure; slower uptake by busy partners |
| **3. Invitation link plus emailed sign-in link** *(recommended)* | The invitation proves who was invited. On each return the firm asks for a sign-in link to the invited email address, valid for a short time and single-use | No passwords; access is tied to an email inbox; easy to revoke; simple for firms | Depends on email arriving (see risks); anyone with access to that mailbox can sign in |

### How the recommended option works, step by step

1. A firm submits the existing **expression of interest** on the Research or Pilot 2026 page (this stays exactly as it is).
2. A Nigeria Lex staff member reviews it and clicks **"Invite to research portal"**. This creates a *Participant* record for the firm and emails a personal invitation. There is also a **Copy link** button, so the link can be sent by hand if an email does not arrive.
3. The firm's contact clicks the link, sees a short **welcome and consent page** (who will see the data, the confidentiality warning), and enters their workspace.
4. The workspace shows the eight sections with progress ticks.
5. To return later, the firm goes to the portal page, types their email address, and receives a new one-time sign-in link. The page gives the **same message whether or not the address is known**, so nobody can use it to discover who is participating.

### Security of the access

- Invitation links contain a long random code (unguessable). Only a scrambled version of it is stored, so a database leak does not reveal usable links.
- Invitations **expire** (for example after 60 days) and sign-in links after about 30 minutes, single use.
- Nigeria Lex can **resend, extend or revoke** an invitation at any time. Revoking ends any open session at once.
- Sessions use secure, HTTP-only cookies, kept separate from the staff and member logins. Access to one never gives access to the other.
- Limits on how often sign-in links can be requested, to stop abuse.
- Optional: allow up to **2 or 3 named colleagues per firm**, each with their own link, so several people can contribute without sharing one link.

---

## 4. Save and return later

- **Where it is saved:** on the Nigeria Lex database, per firm. It is not stored only in the browser, so it works across devices and survives clearing the browser.
- **When it saves:** automatically after a short pause in typing, and always when the participant moves to another section or clicks **Save and continue later**. The screen shows "Saved at 14:32".
- **Incomplete drafts are allowed.** Required-field checks apply on final submission, not while saving. The Review page lists exactly what is still missing.
- **Progress:** each section shows *Not started / In progress / Complete*, plus an overall percentage. Staff see the same in the admin area.
- **Two people editing at once:** the system detects it and warns before one person overwrites another's changes, instead of silently losing work.
- **Leaving with unsaved text** triggers a browser warning.
- **After submission the form locks.** If a correction is needed, Nigeria Lex can **reopen** it for the firm. The reason is recorded, and the version that was originally submitted is kept.

---

## 5. Questionnaire structure and statuses

### Sections

**Firm Profile → Practice Areas → Representative Matters → Practitioners → Client/Investor Experience → Cross-Border Experience → Evidence & Verification → Review & Submit**

- One section per screen, with a progress bar, and Back / Save / Next.
- **Representative Matters:** a **+ ADD REPRESENTATIVE MATTER** button adds a structured block, repeated as often as needed (with an optional cap, for example 15). Each matter can be edited, reordered or removed. **Practitioners** works the same way.
- **Review & Submit:** a read-only summary of everything entered, a list of anything missing, the confidentiality reminder, a declaration tick-box, then **Submit**.

### Statuses

| Status | Meaning | Who sets it |
|---|---|---|
| **Draft / In progress** | Started or saved, not final | Automatic |
| **Submitted** | The firm has pressed Submit. Locked | The firm |
| **Under review** | Nigeria Lex / SBM are assessing it | Nigeria Lex staff |

Two extra states I suggest, because they are useful in practice: **Invited (not started)**, so you can see who has not begun, and **Returned for changes**, used when a submitted form is reopened. Tell me if you want them left out.

### The fields themselves

I do not yet have the actual questionnaire. To build it I need the questions, and which are required. The data will be stored as **proper structured fields** (not one big text box), so it can be searched, filtered and exported cleanly, and each firm's matters appear as separate rows in exports.

---

## 6. Confirmation on submission

- **On screen:** a Nigeria Lex-branded confirmation page with a **reference number** (for example `NLPS-0007`), the date and time received, and what happens next.
- **By email:** a receipt to the submitting contact, including the reference and a summary. Nigeria Lex staff also receive an alert.
- Optional: a **"Download my submission" copy (PDF)** for the firm's own records.

---

## 7. Nigeria Lex control of the research data (point 4)

| You asked to be able to… | How it will work |
|---|---|
| View submissions and their status | New **Research Portal** area in the admin: a list by firm with status, progress %, last saved, dates |
| Identify incomplete vs completed | Filters for *Invited / Draft / Submitted / Under review*, plus a progress percentage and "last activity" date |
| Export the data | **Excel workbook (one sheet each for submissions, matters and practitioners)** and CSV. Filters carry into the export. Exports are recorded in the Activity Log |
| Download or retain supporting documents | Only once uploads are approved (section 9). Then a per-submission download and a bulk download |
| Keep an independent copy | A scheduled **encrypted backup** to a storage location owned by K&C, separate from the website host (section 10) |
| Control administrator access | Super Administrator role held by named K&C people. Everything is logged |
| Remove or revoke access | Suspend a staff or SBM user, or revoke a firm's invitation. Immediate |

**Separation from other data.** Research portal data is stored separately from public website content, subscribers/members, and the Commercial Register. Access to one never gives access to the others. The existing public "expression of interest" records stay where they are.

---

## 8. SBM access (point 5)

- SBM researchers receive a separate **"Research reviewer"** login, created and controlled by a K&C Super Administrator, marked as SBM in the audit trail.
- **Default permissions:** they can view **Submitted and Under review** submissions (read-only). They cannot see firms' unfinished drafts (you can change that), invitations or links, other parts of the admin, the Commercial Register (unless separately granted), user management, settings or the database.
- **Optional, decided by K&C per person:** permission to export; a limit to particular firms; an **automatic end date** (for example the end of the Pilot).
- **Add or remove:** K&C adds a user and picks the role; removal is one click (*Active* switched off). Access ends at the next request.
- **Everything they do is recorded:** for this data I will also log **who viewed, downloaded or exported which submission**. (This goes beyond the Activity Log, which today does not record views.)
- **What SBM never receive:** administrator rights, the domain, hosting or database credentials, or the backups.

**Honest limitation:** once a reviewer views or exports data, the copy is in their hands. Controlling what they do with it is a legal and contractual matter, so I recommend a short data-sharing agreement between K&C and SBM, and that the participant welcome page tells firms that Nigeria Lex and SBM will see their submission.

---

## 9. Confidentiality and uploads (point 9)

- The existing warning that **legally privileged or highly sensitive confidential information must not be uploaded or entered** through the ordinary website form will be kept, on the welcome page, at the start of the Evidence section, next to any upload button and on the Review page.
- **Uploads will not be active at launch.** The feature will exist behind a switch that only a Super Administrator can turn on. Until then, the Evidence & Verification section will let firms *describe* their evidence and give **links** to publicly available material (for example press reports or court records).
- **Before activating uploads, I need K&C to decide:**

| Decision | My suggestion |
|---|---|
| Should uploads exist at all? | Only if firms genuinely need to send documents; the alternative is that they send evidence separately by arrangement |
| Allowed types and size | PDF, Word, Excel, JPG/PNG, with a per-file limit of about 10 MB and a per-submission limit |
| Where stored | A **private** folder or bucket, never public. Downloads are checked against the user's role **every time** |
| Virus/malware scanning | Yes, before a file is accepted |
| Who can open files | K&C Super Administrators, and SBM reviewers only if K&C chooses |
| Retention and deletion | A stated period after the Pilot ends, with deletion on request |
| Encryption and backups | Encrypted in transit; files included in the encrypted backup |

---

## 10. Administration questions (your point 10)

**Where will the data be stored physically and logically?**
- *Logically:* in a PostgreSQL database, in its own dedicated schema, **not** in any area exposed to the public. Research tables are separate from public content, members and the Commercial Register.
- *Physically:* with whichever provider hosts the production database. For development it is already **Supabase**. The production database has not yet been finally chosen. **My recommendation:** a **separate Supabase project registered to Kaye & Crowther Limited**, created specifically for research data if you want stronger separation from the website. The region should be chosen with K&C's own data-protection advice, taking into account Nigerian rules on personal data and on transfers abroad. I have not verified which regions Supabase offers, so please check before deciding.
- *Files* (only if uploads are approved) follow the storage rule in section 9.

**Which service or provider hosts it?**
Database: Supabase (recommended, K&C-owned account). Website application: Vercel for development; production on your own server, as already decided. Uploaded files, if approved: private storage as in section 9.

**Who holds the master administrator account?**
This is K&C's decision, but I recommend: **at least two named K&C directors or senior staff** hold Super Administrator, using K&C email addresses (**not** mailbox passwords, and **not** the developer or SBM). The developer has a separate, time-limited support login. The first administrator account on the production site should be created by a K&C person, not by the developer. The domain, hosting, Supabase, Vercel and code-repository accounts should be registered to Kaye & Crowther Limited with the developer as a delegated, revocable user.

**How can Nigeria Lex export and back up all data?**
1. **Self-service export** from the admin: the Excel workbook and CSV (section 7).
2. **Scheduled encrypted backup** of the whole research dataset to a location owned by K&C: nightly, kept 30 days, with a monthly copy held offline. *(I will confirm the exact mechanism, such as the database provider's own backups plus a scheduled dump, once the production host is chosen. Some provider backup features depend on the paid plan.)*
3. **A restore test** at least twice a year.

**How can SBM researchers be added or removed?**
By a K&C Super Administrator only (section 8): add a "Research reviewer" login with an optional end date; remove by switching it off.

**What happens if you later change developer or hosting provider?**
- Data is in a **standard PostgreSQL database**, so it can be dumped and restored to any provider. Files are ordinary files. The code is standard and open-source (Next.js and Payload), and should be held in a **repository owned by K&C**.
- Steps for a move: (1) new developer gets access to the K&C repository and accounts; (2) database dump and restore to the new host; (3) copy any files; (4) point the domain to the new host. No data is held in the developer's own accounts or in a vendor's proprietary system.
- I will include a **handover pack**: setup guide, list of accounts and where the secrets are kept, and the restore procedure.

---

## 11. What changes and what stays the same on the current site

- The **Research and Pilot 2026 pages and the expression-of-interest form stay**, including the confidentiality warning. A clear "Already invited? Sign in to the research portal" link will be added.
- The current `research-submissions` records stay as they are (they hold expressions of interest and enquiries). The detailed questionnaire will use **new, separate data tables**.
- New admin area: **Research Portal** (Participants, Submissions, and the SBM reviewer role).
- Everything is recorded in the Activity Log: invitations, sign-ins, first save, submission, reopening, status changes, exports. (Autosaves are not logged individually, to avoid flooding it.)

---

## 12. Suggested phasing

| Phase | Content |
|---|---|
| **A. Core portal** | Invitations and sign-in links; workspace with the eight sections; repeatable matters and practitioners; autosave and return; statuses; submission confirmation (screen and email); admin views; Excel/CSV export; SBM Research reviewer role; view/download logging |
| **B. Uploads** *(only after your approval)* | Private storage, scanning, access-checked downloads, bulk download |
| **C. Refinements** | Extra colleagues per firm, reminder emails to firms that have not finished, a PDF copy for participants, reviewer notes or scoring |

---

## 13. Decisions and inputs I need from you

1. **Approve Option C** (build inside the website) and the **invitation link plus emailed sign-in link** access model, or tell me which alternative you prefer. - Approved Option C
2. **The questionnaire itself:** every question in each section, which are required, and the fields you want for each **representative matter** and **practitioner**. Please also say if there is a cap on matters. - You decide.
3. **SBM permissions:** submitted only, or drafts too? Can they export? Any end date? Do any SBM researchers also need Commercial Register access? - they can draft too, and exports too, no commercial register access.
4. **Uploads:** off at launch as proposed? If they are needed later, the answers to the table in section 9. - if file uploads is required, we already using supabase storage bucket
5. **Master administrators:** the names or roles of the K&C Super Administrators, and confirmation that the K&C-owned accounts will be used. - the role 'admin', email: info@nigerialex.com
6. **Production database:** a K&C-owned Supabase project (recommended) or another host, and the region. It's a K&C-owned supabase, the same code will run on dev and production, only .env values will change.
7. **Pilot timetable:** when the submission window opens and closes, and whether firms should be sent reminders. firms should be sent reminders, open the submission window from now, until Oct 17, include how I can edit it later, incase we need to change it
8. **Policies:** the privacy notice and consent wording for the welcome page, how long drafts and submissions are kept, and whether a data-sharing agreement with SBM is in place. draft it out please, drafts and submissions are kept permanently.
9. **Optional states:** keep or drop *Invited (not started)* and *Returned for changes*. If the states are optional
10. **Email:** which sender address the invitations and receipts should come from (see the risk below). - we're using smtp nodemailer, we purchased webmail with the domain, that is what we're using. user data are private and confidential, won't be made public or sold for any reason, just come up with a smart questionaire for now, something that fits the scope of what is being built.

---

## 14. Risks and things I could not confirm

- **Email delivery is critical.** The whole access model relies on invitation and sign-in emails arriving, not being filtered as spam. I recommend a dedicated sender address on your domain with proper email authentication set up by whoever manages your DNS. The **Copy link** button is the fallback.
- **The questionnaire is not yet known.** The design of the data tables and the effort depend on it. Changing questions after firms have started is harder than agreeing them first, so please finalise the questions before the window opens.
- **Provider details** (Supabase regions, backup features on each plan, Google Forms' current save-progress behaviour) are from general knowledge and should be checked before you rely on them.
- **This is not legal advice.** Data-protection, cross-border transfer and confidentiality questions should be confirmed by K&C's own counsel.
- As with earlier updates, I cannot run the site in my environment, so the build will come with a checklist for you to test on the development site before any firm is invited.
