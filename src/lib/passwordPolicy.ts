/**
 * Password policy for staff (users) and public members.
 *
 * Payload stores only salted, iterated hashes of passwords and never the
 * plaintext, but it does not enforce any strength rules by itself. These are
 * applied in each auth collection's `beforeValidate` hook (create/update) and
 * `beforeOperation` hook (reset-password).
 *
 * Nigeria Lex mailbox passwords must NOT be reused for the website, the
 * Commercial Register or member accounts — those are separate systems with
 * separate credentials.
 */

const BLOCKED_FRAGMENTS = [
  'password',
  'qwerty',
  'letmein',
  'welcome',
  'iloveyou',
  'nigerialex',
  'kayecrowther',
  'sbmintelligence',
  '12345678',
]

export const PASSWORD_HINT =
  'At least 12 characters, using at least three of: lowercase, uppercase, numbers and symbols.'

/** Returns a human-readable problem, or null when the password is acceptable. */
export function validatePassword(password: unknown, email?: unknown): string | null {
  if (typeof password !== 'string' || password.length === 0) return 'A password is required.'
  if (password.length < 12) return 'Password must be at least 12 characters long.'
  if (password.length > 128) return 'Password must be no more than 128 characters long.'

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  if (classes < 3) {
    return 'Password must use at least three of: lowercase letters, uppercase letters, numbers and symbols.'
  }

  const lower = password.toLowerCase()
  if (BLOCKED_FRAGMENTS.some((fragment) => lower.includes(fragment))) {
    return 'Password is too easy to guess. Please choose something less predictable.'
  }

  if (typeof email === 'string' && email.includes('@')) {
    const local = email.split('@')[0].toLowerCase()
    if (local.length >= 4 && lower.includes(local)) {
      return 'Password must not contain your email name.'
    }
  }

  return null
}
