import nodemailer from "nodemailer";

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

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
let transporterHost: string | null = null;
let warnedMissingConfig = false;
let warnedFallback = false;

/** Connection-level failures (wrong/unreachable host, blocked port) — worth
 * retrying against localhost. Auth/message failures are not retried here. */
function isConnectionError(error: unknown): boolean {
  const code = (error as { code?: string } | undefined)?.code;
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "EHOSTUNREACH" ||
    code === "ENOTFOUND"
  );
}

function buildTransporter(host: string) {
  const port = Number(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (implicit TLS), false for 587 (STARTTLS)
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Fail fast (default OS-level TCP timeouts can take a minute+) so a
    // blocked/unreachable mail server doesn't hang the request that
    // triggered the email — see the localhost fallback below for why this
    // commonly happens on cPanel specifically.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
}

function getTransporter(host: string) {
  if (!transporter || transporterHost !== host) {
    transporter = buildTransporter(host);
    transporterHost = host;
  }
  return transporter;
}

export function getStaffNotifyEmail() {
  return process.env.EMAIL_NOTIFY_TO || "info@nigerialex.com";
}

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/** Low-level send. Never throws — logs and resolves either way, so a failed
 * or unconfigured email never breaks the request that triggered it.
 *
 * On a connection-level failure (ETIMEDOUT/ECONNREFUSED/etc — the mail
 * server never answered) against a non-localhost SMTP_HOST, this retries
 * once via `localhost`. This is a very common cPanel gotcha: cPanel's
 * firewall (CSF/ConfigServer) frequently blocks a server from reaching
 * *itself* on port 465/587 via its own public IP/hostname, even though
 * the mailbox lives on that same server — the fix cPanel support usually
 * gives is "use localhost as the SMTP host from an app on the same
 * account". If the fallback succeeds, update SMTP_HOST=localhost in your
 * env vars directly so future sends skip the failed first attempt. */
export async function sendEmail(
  input: SendEmailInput,
): Promise<{ sent: boolean }> {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  const from =
    process.env.EMAIL_FROM ||
    SMTP_USER ||
    "Nigeria Lex <no-reply@nigerialex.com>";

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warnedMissingConfig) {
      console.warn(
        "[email] SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — emails will be logged instead of sent. See src/lib/email.ts for setup.",
      );
      warnedMissingConfig = true;
    }
    console.log("[email:not-sent — SMTP unconfigured]", {
      to: input.to,
      subject: input.subject,
    });
    return { sent: false };
  }

  const mail = {
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
  };

  try {
    await getTransporter(SMTP_HOST).sendMail(mail);
    return { sent: true };
  } catch (error) {
    const isLocalAlready =
      SMTP_HOST === "localhost" || SMTP_HOST === "127.0.0.1";
    if (isConnectionError(error) && !isLocalAlready) {
      if (!warnedFallback) {
        console.warn(
          `[email] could not reach SMTP_HOST=${SMTP_HOST} (${(error as { code?: string }).code}) — retrying via localhost. ` +
            "If this works, set SMTP_HOST=localhost in your env vars so future sends skip the failed first attempt.",
        );
        warnedFallback = true;
      }
      try {
        await getTransporter("localhost").sendMail(mail);
        return { sent: true };
      } catch (fallbackError) {
        console.error("[email] send failed (localhost fallback also failed)", {
          to: input.to,
          subject: input.subject,
          error: fallbackError,
        });
        return { sent: false };
      }
    }

    console.error("[email] send failed", {
      to: input.to,
      subject: input.subject,
      error,
    });
    return { sent: false };
  }
}

/** Generic "new [X] received" alert to Nigeria Lex staff. */
export async function sendStaffAlert(subject: string, lines: string[]) {
  return sendEmail({
    to: getStaffNotifyEmail(),
    subject,
    text: lines.join("\n"),
  });
}

export async function sendSubscriberConfirmationEmail({
  email,
  firstName,
  unsubscribeUrl,
}: {
  email: string;
  firstName?: string | null;
  unsubscribeUrl: string;
}) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  return sendEmail({
    to: email,
    subject: "Thank you for subscribing to Nigeria Lex",
    text: [
      greeting,
      "",
      "Thank you for subscribing to Nigeria Lex.",
      "",
      "You'll receive Nigeria Lex research, market intelligence and briefing invitations at this address.",
      "",
      `You can unsubscribe at any time: ${unsubscribeUrl}`,
      "",
      "Nigeria Lex",
    ].join("\n"),
    html: `
      <p>${greeting}</p>
      <p>Thank you for subscribing to Nigeria Lex.</p>
      <p>You'll receive Nigeria Lex research, market intelligence and briefing invitations at this address.</p>
      <p><a href="${unsubscribeUrl}">Unsubscribe</a> at any time.</p>
      <p>Nigeria Lex</p>
    `,
  });
}

export async function sendResearchSubmissionConfirmationEmail({
  email,
  contactName,
}: {
  email: string;
  contactName?: string | null;
}) {
  const greeting = contactName ? `Hi ${contactName},` : "Hi,";
  return sendEmail({
    to: email,
    subject: "Submission received — Nigeria Lex",
    text: [
      greeting,
      "",
      "Thank you. The Nigeria Lex research team has received your submission and will review it, following up by email where relevant.",
      "",
      "Nigeria Lex",
    ].join("\n"),
    html: `
      <p>${greeting}</p>
      <p>Thank you. The Nigeria Lex research team has received your submission and will review it, following up by email where relevant.</p>
      <p>Nigeria Lex</p>
    `,
  });
}

export async function sendContactConfirmationEmail({
  email,
  name,
}: {
  email: string;
  name?: string | null;
}) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return sendEmail({
    to: email,
    subject: "Message received — Nigeria Lex",
    text: [
      greeting,
      "",
      "Thank you for getting in touch with Nigeria Lex. We have received your message and will respond as soon as possible.",
      "",
      "Nigeria Lex",
    ].join("\n"),
    html: `
      <p>${greeting}</p>
      <p>Thank you for getting in touch with Nigeria Lex. We have received your message and will respond as soon as possible.</p>
      <p>Nigeria Lex</p>
    `,
  });
}
