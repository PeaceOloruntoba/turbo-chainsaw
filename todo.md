# Nigeria Lex Research Portal — Simple Guide

This guide explains what the Pilot 2026 research portal does and how the Nigeria Lex team, SBM reviewers, and invited law firms use it.

## What the portal does

- Collects detailed **law-firm** research submissions in eight short sections instead of one long form.
- Lets firms save progress automatically and return on another device using a single-use email sign-in link.
- Keeps drafts separate from final submissions. A firm must use **Submit final questionnaire** before its answers count as submitted.
- Lets Nigeria Lex invite firms, see status and progress, change the submission dates, manage the questions, review submissions, export data and revoke access.
- Lets authorised SBM research reviewers read drafts and completed submissions and download CSV exports. They do not receive access to the website settings, invitations, members, Commercial Register or administrator controls.
- Stores the portal records in Kaye & Crowther’s configured PostgreSQL/Supabase environment. Development and production use separate connection settings.

Drafts and submissions are retained permanently. Information is private and is not made public or sold. The portal warns firms not to enter legally privileged or highly sensitive confidential information.

## Opening the portal

The public sign-in page is:

`https://nigerialex.com/research-portal`

An invited firm can also open the personal invitation link sent to its contact email. The invitation link is for first access. On later visits, the firm enters its invited email address on the portal page and requests a fresh sign-in link. That link expires after 30 minutes and works once.

The current window opens **30 September 2026** and closes **17 October 2026 at 11:59 pm Nigeria time (WAT)**. A firm can save its draft after the deadline, but cannot submit it unless an administrator extends the window.

## Nigeria Lex team: inviting a firm

1. Sign in at `/admin` with a Nigeria Lex administrator account.
2. In **Research Portal → Participants**, choose **Create New**.
3. Enter the firm name, the contact’s name and the contact’s email address, then save.
4. The system creates an **Invited (not started)** submission and emails the invitation.
5. To resend an invitation, open the firm, tick **Send invite**, and save.
6. To stop access, untick **Active** and save. This revokes the invitation and ends the firm’s portal access. To invite the firm again, turn it back on and send a new invitation.

Use the contact email from the firm’s existing expression of interest. The expression-of-interest form remains separate from the detailed questionnaire.

## What firms do

1. Open the invitation link or go to `/research-portal` and request a sign-in email.
2. Complete each section. **Representative Matters** and **Practitioners** have an **Add** button for as many entries as the firm needs.
3. Answers save automatically after a short pause. **Save now** is also available. The page shows the last save time.
4. Use **Review & Submit** to check the answers and read the privacy notice. Tick the declaration and select **Submit final questionnaire**.
5. The page confirms receipt and emails a reference number. Submitted answers are locked. If a correction is needed, Nigeria Lex can return the form for changes.

A draft is not a submission. Required answers are checked only when the firm submits. The portal warns before a browser is closed if changes have not finished saving.

## Reviewing submissions

Open **Research Portal → Research Portal Submissions** in `/admin`.

- **Invited (not started):** the firm has been invited but has not entered answers.
- **Draft / In progress:** the firm has saved a draft.
- **Submitted:** the firm pressed the final submit button; the questionnaire is locked.
- **Under Review:** Nigeria Lex has started assessing the submission.
- **Returned for changes:** Nigeria Lex has reopened it and given the firm a reason.

Open a submission to read its answers. Use **Mark under review** when assessment starts. Use **Return for changes** to enter a reason and email the firm. The previous submitted answers are kept in the submission history. Once the firm resubmits, its new answers become the current submission. **Reopen as draft** is available for a returned form.

SBM users with the **Research reviewer (SBM)** role can read every submission, including drafts, but cannot edit or change statuses. They can export data. To add one, an administrator opens **Members & Access → Users**, creates a user, sets the role to **Research reviewer (SBM)** and organisation to **SBM Intelligence**, then saves. To remove access, untick **Active**. An optional reviewer access end date can also be set on the user account.

## Editing questions and dates

Only administrators can change these settings:

- Open **Research Portal → Research Portal Settings**.
- In **Sections**, add, rename, reorder or remove a section. In a section, add or remove a field, choose its type, set its choices, and tick or untick **Required** and **Active**.
- To retire a question but keep it available to restore, untick **Active**. If a field is deleted, its saved answers remain in the submission’s answer data and exports. Re-adding a field with the same ID shows its old answers again.
- Each invited submission keeps a copy of the questionnaire it received. Later questionnaire edits do not silently change that firm’s form. New invitations use the latest version.
- Change **Window Opens At** or **Window Closes At** to edit the timetable. Enter the time in Nigeria time (WAT). Submission is automatically blocked outside the window.
- **Reminders Enabled** controls the email reminders. The system sends a weekly reminder, then one at three days and one day before closing, to firms that have not submitted.
- **Uploads Enabled** is off by default. Turn it on to show the upload area; turn it off to stop new uploads and downloads.
- **Privacy Notice** and **Consent Text** control what firms see before submission.

The questionnaire starts with Firm Profile, Practice Areas, Representative Matters, Practitioners, Client / Investor Experience, Cross-Border Experience, Evidence & Verification, and Review & Submit. Evidence & Verification includes a firm-publication permission question.

## Supporting documents

Uploads are off until a Nigeria Lex administrator enables them. When enabled, firms can attach up to five files per submission, each up to 10 MB: PDF, Word, Excel, JPG or PNG. The files use the configured `research/` folder in Supabase Storage and are downloaded through an access-checked route. The storage bucket must be set to **private** in Supabase. The confidentiality warning is shown next to the upload area.

File type and size are checked. **The current app does not run an antivirus scan.** Keep uploads disabled until the team has decided how it wants to scan files before accepting them.

## Exporting data

In the submissions list, choose one of the CSV buttons:

- **Submissions** — firm, status, progress, ordinary question fields and a complete answers JSON column (including retired fields).
- **Representative matters** — one row per matter.
- **Practitioners** — one row per practitioner.

CSV files open in Excel. Exports are recorded in the Activity Log. Supporting files can be downloaded from a submission by an authorised administrator or SBM reviewer, or from the firm’s own signed-in portal.

## Reminders and independent backups

The app provides two protected daily jobs. The host must be configured to call them; they do not run by themselves inside the website.

1. Create a long random `RESEARCH_CRON_SECRET` and set it in the server environment.
2. Configure a daily host cron job for these URLs, with an `Authorization: Bearer <RESEARCH_CRON_SECRET>` header:
   - `/api/research-portal/reminders`
   - `/api/research-portal/backup`
3. Set the job for about **9:00 am Nigeria time**. For a UTC-only scheduler, use **08:00 UTC**.
4. For encrypted backups, set `RESEARCH_BACKUP_BUCKET`, `RESEARCH_BACKUP_ACCESS_KEY_ID`, `RESEARCH_BACKUP_SECRET_ACCESS_KEY`, `RESEARCH_BACKUP_KEY` (base64 encoding of a random 32-byte key), and, if needed, `RESEARCH_BACKUP_ENDPOINT` and `RESEARCH_BACKUP_REGION`. These credentials should point to a separate K&C-controlled private bucket/project, not the website’s public files bucket.
5. The backup contains firms, submissions, questionnaire settings and uploaded files. It is compressed and encrypted with AES-256-GCM before it leaves the app. Keep the encryption key separately from the bucket credentials.
6. Download a `.nlbackup` file from the backup bucket before restoring. Configure `.env` for the empty destination database and storage, set the same `RESEARCH_BACKUP_KEY`, then run `npm run restore:research -- <path-to-backup.nlbackup>`. Restore refuses to run if the destination already contains participants.

Keep a second copy of the encryption key and periodically practise restoring into a separate, empty development database. The backup bucket should have its own retention/lifecycle policy.

## First deployment checklist

- Set development and production `DATABASE_URI` values to the **separate K&C Supabase projects**. Keep the database schema outside Supabase’s exposed `public` schema.
- Set `PAYLOAD_SECRET`, the SMTP values (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) and `EMAIL_FROM="Nigeria Lex <info@nigerialex.com>"` in both environments.
- Configure `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` for the private upload bucket. An administrator must still enable uploads in portal settings.
- Apply the new Payload schema on the target database before opening the portal. Use the project’s Payload migration workflow or the secured schema-push procedure in the developer guide.
- Sign in to `/admin` as `info@nigerialex.com`, make sure a second K&C administrator is available, confirm the opening/closing times, then invite a test firm.
- Create SBM logins individually. Give only the Research reviewer role unless a person has a separate, approved role for other work.
- Configure the reminder and backup cron jobs and test email delivery before sending real invitations.

## Troubleshooting

- **No sign-in email?** Check the SMTP settings and spam folder. The same message appears whether an email is invited or not. An administrator can resend an invitation from the Participants record.
- **Firm cannot sign in?** Check the contact email, **Active** setting and invitation status. Sign-in links expire after 30 minutes; request another.
- **Firm cannot submit?** Check the closing time in Research Portal Settings. Draft saving remains available after the window closes.
- **Upload fails?** Confirm the admin switch is on, the bucket is private and configured, and the file is an allowed type under 10 MB.
- **Need to correct a final submission?** Open it in the admin and choose **Return for changes**, entering a reason. The firm receives an email and the original answers remain in history.

## Data access at a glance

| User | Portal access |
|---|---|
| Invited firm contact | Its own submission and its own supporting files |
| Nigeria Lex / K&C administrator | Invitations, all submissions, settings, reviews, exports and access control |
| SBM Research reviewer | Read-only access to all drafts and submissions, supporting files and CSV exports |
| Other site roles | No Research Portal access unless separately granted |
