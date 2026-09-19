import type { EmailAdapter } from 'payload'
import { sendEmail } from './email'

/**
 * Bridges Payload's own emails (member email verification, member and staff
 * password reset) onto the existing Nodemailer/SMTP sender in `./email.ts`.
 *
 * Before this, Payload had no email adapter configured, so those emails were
 * only written to the server log. With this adapter they go out through the
 * same SMTP settings as the other transactional emails (SMTP_* env vars). If
 * SMTP is not configured, `sendEmail` logs and skips — it never throws.
 */

type Address = string | { name?: string; address?: string }

const toAddress = (a: Address): string =>
  typeof a === 'string' ? a : a.name ? `${a.name} <${a.address}>` : String(a.address ?? '')

const toAddressList = (to: unknown): string => {
  if (!to) return ''
  const list = Array.isArray(to) ? (to as Address[]) : [to as Address]
  return list.map(toAddress).filter(Boolean).join(', ')
}

const htmlToText = (html: string) =>
  html
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim()

export const nigeriaLexEmailAdapter: EmailAdapter = () => ({
  name: 'nigeria-lex-smtp',
  defaultFromAddress: process.env.SMTP_USER || 'info@nigerialex.com',
  defaultFromName: 'Nigeria Lex',
  sendEmail: async (message) => {
    const html = typeof message.html === 'string' ? message.html : undefined
    const text = typeof message.text === 'string' ? message.text : html ? htmlToText(html) : ''
    return sendEmail({
      to: toAddressList(message.to),
      subject: String(message.subject ?? ''),
      text,
      html,
    })
  },
})
