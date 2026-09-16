import nodemailer from 'nodemailer'

/**
 * Thin wrapper around Nodemailer/SMTP for the site's transactional emails
 * (subscriber + research/contact confirmations, staff alerts).
 *
 * Sends via the cPanel webmail mailbox for nigerialex.com (e.g.
 * info@nigerialex.com) rather than a third-party provider like Gmail — see
 * `.env.example` for where to find the exact host/port cPanel gives that
 * mailbox (usually visible in webmail's "Configure Mail Client" screen at
 * https://nigerialex.com/webmail).
 *
 * Configuration (all read from process.env, set in `.env`):
 *   SMTP_HOST      cPanel's mail server for the domain, e.g. mail.nigerialex.com
 *                  (sometimes a server hostname like server123.yourhost.com —
 *                  check "Configure Mail Client" in webmail for the exact value)
 *   SMTP_PORT      465 (SSL) or 587 (STARTTLS) — both work, see `secure` below
 *   SMTP_USER      the full sending mailbox address, e.g. info@nigerialex.com
 *   SMTP_PASS      that mailbox's webmail/email account password (the same
 *                  one used to log in at https://nigerialex.com/webmail —
 *                  not a cPanel account password)
 *   EMAIL_FROM     optional "From" header override, e.g. 'Nigeria Lex <info@nigerialex.com>'
 *   EMAIL_NOTIFY_TO  staff inbox that receives new-subscriber / new-submission /
 *                    new-contact-message alerts. Defaults to info@nigerialex.com
 *                    if unset, but is fully configurable without a code change.
 *
 * If SMTP isn't configured, sends are skipped (logged to the console) rather
 * than throwing — a missing/incomplete email setup should never block a
 * subscriber or submission from being saved.
 */

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null
let warnedMissingConfig = false

function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warnedMissingConfig) {
      console.warn(
        '[email] SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — emails will be logged instead of sent. See src/lib/email.ts for setup.',
      )
      warnedMissingConfig = true
    }
    return null
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // true for 465 (implicit TLS), false for 587 (STARTTLS)
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }

  return transporter
}

export function getStaffNotifyEmail() {
  return process.env.EMAIL_NOTIFY_TO || 'info@nigerialex.com'
}

type SendEmailInput = {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
}

/** Low-level send. Never throws — logs and resolves either way, so a failed
 * or unconfigured email never breaks the request that triggered it. */
export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean }> {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'Nigeria Lex <no-reply@nigerialex.com>'
  const t = getTransporter()

  if (!t) {
    console.log('[email:not-sent — SMTP unconfigured]', { to: input.to, subject: input.subject })
    return { sent: false }
  }

  try {
    await t.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    })
    return { sent: true }
  } catch (error) {
    console.error('[email] send failed', { to: input.to, subject: input.subject, error })
    return { sent: false }
  }
}

/** Generic "new [X] received" alert to Nigeria Lex staff. */
export async function sendStaffAlert(subject: string, lines: string[]) {
  return sendEmail({
    to: getStaffNotifyEmail(),
    subject,
    text: lines.join('\n'),
  })
}

export async function sendSubscriberConfirmationEmail({
  email,
  firstName,
  unsubscribeUrl,
}: {
  email: string
  firstName?: string | null
  unsubscribeUrl: string
}) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,'
  return sendEmail({
    to: email,
    subject: 'Thank you for subscribing to Nigeria Lex',
    text: [
      greeting,
      '',
      'Thank you for subscribing to Nigeria Lex.',
      '',
      "You'll receive Nigeria Lex research, market intelligence and briefing invitations at this address.",
      '',
      `You can unsubscribe at any time: ${unsubscribeUrl}`,
      '',
      'Nigeria Lex',
    ].join('\n'),
    html: `
      <p>${greeting}</p>
      <p>Thank you for subscribing to Nigeria Lex.</p>
      <p>You'll receive Nigeria Lex research, market intelligence and briefing invitations at this address.</p>
      <p><a href="${unsubscribeUrl}">Unsubscribe</a> at any time.</p>
      <p>Nigeria Lex</p>
    `,
  })
}

export async function sendResearchSubmissionConfirmationEmail({
  email,
  contactName,
}: {
  email: string
  contactName?: string | null
}) {
  const greeting = contactName ? `Hi ${contactName},` : 'Hi,'
  return sendEmail({
    to: email,
    subject: 'Submission received — Nigeria Lex',
    text: [
      greeting,
      '',
      'Thank you. The Nigeria Lex research team has received your submission and will review it, following up by email where relevant.',
      '',
      'Nigeria Lex',
    ].join('\n'),
    html: `
      <p>${greeting}</p>
      <p>Thank you. The Nigeria Lex research team has received your submission and will review it, following up by email where relevant.</p>
      <p>Nigeria Lex</p>
    `,
  })
}

export async function sendContactConfirmationEmail({
  email,
  name,
}: {
  email: string
  name?: string | null
}) {
  const greeting = name ? `Hi ${name},` : 'Hi,'
  return sendEmail({
    to: email,
    subject: 'Message received — Nigeria Lex',
    text: [
      greeting,
      '',
      'Thank you for getting in touch with Nigeria Lex. We have received your message and will respond as soon as possible.',
      '',
      'Nigeria Lex',
    ].join('\n'),
    html: `
      <p>${greeting}</p>
      <p>Thank you for getting in touch with Nigeria Lex. We have received your message and will respond as soon as possible.</p>
      <p>Nigeria Lex</p>
    `,
  })
}
