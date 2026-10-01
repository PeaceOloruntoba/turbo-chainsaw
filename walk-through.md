# Nigeria Lex website walkthrough

A plain-language guide for a live demonstration of Nigeria Lex. Use the order below: first show what a visitor sees, then demonstrate the law-firm research portal, and finish in the administration area. The guide describes features that are present in the application; what a visitor can access may depend on the current site settings and their account.

## Before the meeting

- Have the public site open in one browser tab and `/admin` open in another.
- Sign in to the admin area with your own account. Each staff member should use an individual login.
- If possible, have a test firm invitation available for the research portal. Avoid showing real participant answers unless the audience is authorised to see them.
- Avoid making and saving demo edits in production unless you intend them to go live. If you do make an edit, restore the original text before finishing.
- The research questionnaire displays a warning not to submit legally privileged or highly sensitive confidential information.

## 1. Start on the public website

### Home — `/`

Show the main message, the Nigeria Lex purpose, the research and intelligence areas, and the links leading visitors into the rest of the site. Point out the independence statement: participation in research and editorial assessment is separate from commercial relationships.

In the admin area, the main home page text is edited under **Page Content → Home Content**. The editable items include the headline and introduction, button labels and destinations, the “What We Do” feature cards, and the Pilot Study teaser.

### About — `/about`

Explain who Nigeria Lex is, its purpose, leadership, ownership by Kaye & Crowther Limited, and the research relationship with SBM Intelligence.

To edit this page, use **Page Content → About Content**. The form contains the tagline, “Who We Are,” purpose, leadership details, ownership text, and research partner text.

### Research — `/research`

This page explains the methodology, research sources, assessment criteria, research process, independence, corrections, and how organisations can participate. Scroll down to show the research information form. This form is an expression of interest or contribution; it is separate from the secure, invited-firm questionnaire shown later.

Edit this page in **Page Content → Research Content**. Its fields include the methodology, source list, assessment criteria, process stages, independence statement, corrections text, and participation introduction.

### Pilot Study 2026 — `/pilot-2026`

Show the pilot explanation, what is being researched, why it matters, who can participate, the timetable and proposed presentation information. Demonstrate the separate routes for law firms, institutional contributors, pilot updates, and already-invited firms.

The two forms on this page collect initial information; they do not themselves submit the full firm questionnaire. The update form adds a person to the mailing list. Edit the page’s content in **Page Content → Pilot 2026 Content**.

### Firms & Lawyers — `/firms`

Explain that this is the public research directory. Only firm records marked **Published** appear to visitors. Profiles can include an overview, practice areas, capabilities, representative experience, sector strengths, lawyers, cross-border experience, and Nigeria Lex analysis. Public visibility of detailed profile fields also depends on the record’s access level and member access settings.

The directory is managed in **Research → Firms**. To add a lawyer, use **Research → Lawyers** and associate the lawyer with the firm. A firm left in **Pilot 2026 (in progress)** is not displayed as a published profile. Do not present research status as paid placement or a ranking that can be purchased.

### Intelligence — `/intelligence`

Show the article and report listing. Explain that an item’s title and summary are visible on the listing, while its full text and download can require a free registered account or subscriber/institutional access.

Open an article to demonstrate its full page. Categories include Article, Report, Briefing, Sector Briefing, Transaction Intelligence, Regulatory Intelligence, and Investor Briefing.

### Events — `/events`

Show event listings and the information available on each event, such as its date, venue, description, speakers, and registration link. Events are created or edited under **Content → Events**.

### Subscribe and unsubscribe — `/subscribe`, `/unsubscribe`

Show how a visitor can subscribe to email updates. Every subscription email includes an unsubscribe link; the visitor can also use the unsubscribe page. The admin list is under **Audience → Subscribers**, where subscription status can be reviewed.

### Contact — `/contact`

Show the visitor contact form and explain that messages are stored for the team to follow up. Review them under **Audience → Contact Messages**. Do not display personal messages during a public demonstration.

### Legal notices — footer links under `/legal/...`

Show where the Privacy Policy, Cookie Policy, Terms of Use, Disclaimer, Editorial Independence, and Corrections Policy appear in the website footer. Open one page to demonstrate the public view. These notices are managed under **Site Configuration → Legal Pages**. Content-team users can edit the text; the review-status selector distinguishes a draft placeholder from a published notice. A draft placeholder is labelled on the public page, so set a notice to **Published** only when it is ready to be shown as approved copy.

## 2. Member accounts and subscription access

The public member account area is at `/account`. The member portal must be enabled in **Site Configuration → Site Settings** for sign-in and account options to be offered. Registration can be separately allowed or disabled. Check these switches before promising open registration in a demonstration.

When enabled, walk through these pages:

1. **Register — `/account/register`:** a reader provides their details and creates an account if registrations are open.
2. **Verify:** the reader follows the verification link sent to their email.
3. **Sign in — `/account/login`:** members use their own email and password.
4. **My account — `/account`:** the member can view account and access status and manage supported account details.
5. **Forgot/reset password — `/account/forgot-password` and `/account/reset-password`:** password recovery is handled by an emailed link.
6. **Sign out:** the member ends their account session.

Explain the three content levels:

- **Public:** anyone can read it.
- **Registered users:** a verified member account is required.
- **Subscribers / institutional users:** an approved account with active subscriber access is required.

Subscription payment processing is not live. Subscriber or institutional access is assigned by an administrator and may have an expiry date. Super Administrators manage accounts under **Members & Access → Members**: approve an institution, set the access level and expiry, suspend an account, or export the member list. A suspended member loses access. Do not describe this as an online paid checkout.

## 3. Invited-firm research portal

Open **`/research-portal`**. This is separate from the public research contribution form: the detailed Pilot 2026 questionnaire is for firms that Nigeria Lex has invited.

### Firm’s view

1. The invited contact opens the invitation link sent to their nominated email. On later visits, they request a one-time sign-in link using the invited email address.
2. The contact completes the questionnaire one section at a time. The structure is managed by the administrator and can include firm profile, practice areas, representative matters, practitioners, client/investor experience, cross-border experience, evidence and verification, and review/submit.
3. Representative matters and practitioners can be added as repeatable entries.
4. Answers save automatically as a draft; the firm can also use the save control and return later. A draft is not a final submission.
5. In Review & Submit, the firm completes required fields and the declaration, then explicitly submits the questionnaire.
6. The firm sees a receipt and receives an email with its submission reference. Submitted answers are locked unless Nigeria Lex returns the submission for changes.

The portal keeps the questionnaire structure used for each firm’s submission. If an administrator later changes or removes a question, existing responses remain preserved with the submitted data.

### Nigeria Lex administrator’s view

In `/admin`, open the **Research Portal** group:

- **Participants:** create an invited firm with a contact name and email, send or resend its invitation, see its invitation details, or deactivate it to revoke access.
- **Research Portal Submissions:** see submission status, progress and answers. Available states include invited/not started, draft/in progress, submitted, under review and returned for changes. Mark a submission under review, or return it to the firm with a reason. The firm receives the return message and can revise and resubmit.
- **Research Portal Settings:** configure the questionnaire sections and fields, submission window, privacy and consent wording, and upload availability. Changes to a questionnaire do not erase answers already received.
- **Exports:** use the research export controls to download submission and repeatable response data in CSV format for use in a spreadsheet.
- **Documents:** research uploads and downloads are access-controlled. Uploads are off unless an administrator enables them in the portal settings. Only enable them when the organisation is satisfied with the storage and access arrangements. Keep the warning against uploading privileged or highly sensitive confidential information visible to participants.

### SBM research reviewers

An authorised user with the **Research reviewer (SBM)** role can read research portal submissions and export research data. This role is for research review and does not grant access to website administration, invitations, member accounts, the Commercial Register, or administrator settings. Reviewers should use named accounts and have only the access needed for their work.

## 4. Admin area: orientation

Open **`/admin`** and sign in. The left-hand menu is organised into groups. Available groups depend on the signed-in person’s role.

| Admin area | What it is for |
|---|---|
| **Content** | Intelligence, Events, Media, and Restricted documents |
| **Research** | Firm and lawyer profiles |
| **Audience** | Subscribers, public research submissions, and contact messages |
| **Page Content** | Home, About, Research, and Pilot 2026 page text |
| **Site Configuration** | Site settings and legal notices |
| **Members & Access** | Public member accounts and staff user accounts, where role permits |
| **Research Portal** | Invited firms, questionnaire submissions, and portal settings |
| **Commercial Register** | Private business opportunities, audit trail and exports for authorised users |
| **Security & Audit** | Activity Log for Super Administrators |

A list page lets an authorised user search or filter records, open a record, create a record, and save changes. The exact buttons shown vary with role and collection.

## 5. Writing and publishing an Intelligence article

Use this flow for an article, report, briefing, sector briefing, transaction intelligence, regulatory intelligence, or investor briefing.

1. In the admin menu, open **Content → Intelligence**.
2. Choose **Create New** (or open an existing item to edit it).
3. Enter the **Title** and a unique URL-friendly **Slug**. The slug forms the end of the article URL; use simple lowercase words separated by hyphens.
4. Choose the **Category**.
5. Write the **Summary**. This is shown on the public listing and acts as the article introduction, so it should make sense on its own.
6. Write the full **Content** using the rich-text editor. Use headings and short paragraphs to make long articles easier to read. Preview the text for spelling, links, and formatting before publishing.
7. Optionally choose an **Author**.
8. Set the **Access level**: Public, Registered users, or Subscribers / institutional users. The title and summary remain public; the full text is restricted to the selected audience.
9. For a downloadable report, use the correct file field:
   - **Public PDF:** attach it in **PDF attachment**. Anyone with the link can download it; use this only for public items.
   - **Restricted download:** first upload the file under **Content → Restricted documents**, then choose it in **Login-protected download**. Its download access follows the article’s access level.
10. Set **Published at**. A past/current date makes it eligible to appear publicly; a future date schedules publication; leaving it blank keeps it unpublished.
11. Save the record. Re-open the public article URL and check the result at the appropriate access level.

Before publishing, confirm that the summary and full text contain no information that should be withheld, that citations and links work, and that the selected access level matches the intended audience. Do not attach a public Media file to a restricted report.

## 6. Editing firm and lawyer research

1. Open **Research → Firms** and create or open a firm record.
2. Complete the firm name and URL slug, then provide the overview, core capabilities, practice areas, representative experience, sector strengths, cross-border experience, and Nigeria Lex analysis as appropriate.
3. Set the access level for detailed content.
4. Keep **Research status** at **Pilot 2026 (in progress)** while the research is not ready for publication. Select **Published** only when the profile is approved for public release.
5. Save and review the public firm page.
6. Open **Research → Lawyers**, create the practitioner record, and associate it with the correct firm. Review the public profile and firm association.

The directory is for independent research. Do not use payment, advertising, or sponsorship as a basis for an assessment or profile placement.

## 7. Updating site pages and shared settings

### Editing a page

Open the corresponding item in **Page Content** (Home Content, About Content, Research Content, or Pilot 2026 Content). Edit the relevant fields, save, then check the public page. Textareas generally preserve line breaks; list sections have add/remove controls for each item. Take care not to remove an item that is still needed by the public page.

### Site-wide details

Open **Site Configuration → Site Settings** to review the site name, strapline, logo, favicon, contact details, footer details and member-portal controls. Some settings affect the shared header or footer across every page. Save, then check the home page and footer.

### Events, media and restricted files

- **Content → Events:** add or edit the event title, slug, date/time, venue, description, speakers and registration link.
- **Content → Media:** manage images and public downloadable files.
- **Content → Restricted documents:** store documents that must be downloaded only by people with the right access. Attach these to the relevant Intelligence item using its protected-download field.

## 8. Managing enquiries, staff and access

### Public submissions and enquiries

- **Audience → Research Submissions:** review information sent through the public research form and update its status as staff process it. These are separate from invited portal questionnaire submissions.
- **Audience → Contact Messages:** view messages sent from the Contact page.
- **Audience → Subscribers:** review email-list registrations and unsubscribe status.

Handle personal information only for its intended purpose. Avoid displaying real contact or research records in a general client demonstration.

### Staff logins and roles

Super Administrators manage staff in **Members & Access → Users**. Give every colleague an individual account and the narrowest role that supports their work. Keep the master administrator accounts under Nigeria Lex/Kaye & Crowther control. Disable a departing colleague’s account rather than sharing or reusing credentials.

The application has separate role boundaries for Super Administrators, Editors, Researchers, Commercial Register editors, Commercial Register view-only users, and Research reviewers (SBM). Commercial Register users receive no automatic access to website content tools; Research reviewers receive no general admin or commercial-register access. Super Administrators have the broadest access. The actual actions permitted are enforced by server-side access rules as well as the admin menu.

## 9. Commercial Register and audit pages

This is an internal, private tool, not part of the public website or research questionnaire. Only Super Administrators and specifically authorised Commercial Register users can access it.

Open **Commercial Register → Commercial Register** to view opportunities and their status, values, invoices, receipts, origination and follow-up. Users can search/filter, update records, see dashboard totals, and export the filtered register. Ordinary users should cancel or archive an incorrect/withdrawn record rather than delete it.

Open **Commercial Register → Audit Trail** to see who changed commercial entries and when. **Security & Audit → Activity Log** is for Super Administrators and records significant actions across the site. The logs are for accountability; they should not be edited or removed through ordinary use.

## 10. Suggested meeting route

A simple 20–30 minute demonstration can follow this route:

1. Home → About → Research and independence.
2. Pilot 2026 → show the public information forms and distinguish them from the invited questionnaire.
3. Firms & Lawyers → Intelligence → Events → Subscribe and Contact.
4. Footer → Privacy Policy and other legal notices.
5. Explain member sign-in and the difference between registered and subscriber access. Show an account only if the member portal is enabled in the current environment.
6. Research Portal → explain invited access, save-and-return, explicit final submission, review states, exports and the ability to preserve responses when questions change.
7. Admin home → edit a page, an Intelligence article, a firm profile, and a legal notice.
8. Show where enquiries, members and access roles are managed.
9. If appropriate for the audience, finish with the private Commercial Register and audit trail.

Close by summarising the separation between public content, member-only content, the invited-firm research data, and the internal Commercial Register. Each has its own access rules.

## 11. Quick reference: public pages and admin locations

| Public page or feature | URL | Main admin location |
|---|---|---|
| Home | `/` | Page Content → Home Content |
| About | `/about` | Page Content → About Content |
| Research and public contribution form | `/research` | Page Content → Research Content; Audience → Research Submissions |
| Pilot 2026 | `/pilot-2026` | Page Content → Pilot 2026 Content |
| Firms | `/firms` | Research → Firms |
| Individual firm | `/firms/{slug}` | Research → Firms |
| Intelligence | `/intelligence` | Content → Intelligence |
| Individual article | `/intelligence/{slug}` | Content → Intelligence |
| Events | `/events` | Content → Events |
| Subscribe | `/subscribe` | Audience → Subscribers |
| Contact | `/contact` | Audience → Contact Messages |
| Legal notices | `/legal/{slug}` | Site Configuration → Legal Pages |
| Member account | `/account` | Members & Access → Members; Site Settings controls availability |
| Invited research portal | `/research-portal` | Research Portal group |
| Admin | `/admin` | Access varies by role |

