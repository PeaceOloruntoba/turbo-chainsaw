'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'

/**
 * Client forms for the member portal. They talk to Payload's built-in,
 * access-controlled `members` auth endpoints (/api/members/login, /logout,
 * /forgot-password, /reset-password, and create/update on /api/members).
 * The session lives in an HTTP-only cookie — nothing sensitive is kept in
 * JavaScript-readable storage.
 */

const PASSWORD_HINT =
  'At least 12 characters, using at least three of: lowercase, uppercase, numbers and symbols.'

type ApiResult = { ok: boolean; status: number; data: any }

async function api(path: string, method: string, body?: unknown): Promise<ApiResult> {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let data: any = null
  try {
    data = await res.json()
  } catch {
    /* empty body */
  }
  return { ok: res.ok, status: res.status, data }
}

function errorMessage(result: ApiResult, fallback: string): string {
  const first = result.data?.errors?.[0]
  return first?.data?.errors?.[0]?.message || first?.message || fallback
}

/** Only allow same-site relative redirects after sign-in. */
function safeNext(next?: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'
}

const inputClass =
  'rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] font-normal text-navy-ink outline-none focus:border-green'
const buttonClass =
  'w-fit rounded-sm bg-green px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep disabled:opacity-60'

function Field({
  label,
  name,
  type = 'text',
  required = false,
  autoComplete,
  defaultValue,
  hint,
  minLength,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
  defaultValue?: string
  hint?: string
  minLength?: number
}) {
  return (
    <label className="grid gap-1.5 text-[13px] font-medium text-navy">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        minLength={minLength}
        className={inputClass}
      />
      {hint && <span className="text-[12px] font-normal text-slate">{hint}</span>}
    </label>
  )
}

function Notice({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={tone === 'error' ? 'text-sm text-red-700' : 'rounded-sm border border-line bg-white p-4 text-sm text-navy-ink'}
    >
      {children}
    </p>
  )
}

/* ── Sign in ─────────────────────────────────────────────────────── */

export function LoginForm({ next }: { next?: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const data = new FormData(e.currentTarget)
    const result = await api('/api/members/login', 'POST', {
      email: String(data.get('email') || '').trim().toLowerCase(),
      password: data.get('password'),
    })
    if (result.ok) {
      // Full navigation so server components pick up the new session cookie.
      window.location.href = safeNext(next)
      return
    }
    setBusy(false)
    setError(
      result.status === 403
        ? errorMessage(result, 'This account cannot sign in right now.')
        : errorMessage(result, 'Sign-in failed. Check your details, and that you have verified your email.'),
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Password" name="password" type="password" required autoComplete="current-password" />
      <button type="submit" disabled={busy} className={buttonClass}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      {error && <Notice tone="error">{error}</Notice>}
      <p className="text-sm text-slate">
        <Link href="/account/forgot-password" className="font-medium text-green">
          Forgotten your password?
        </Link>
      </p>
    </form>
  )
}

/* ── Register ────────────────────────────────────────────────────── */

export function RegisterForm() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    if (data.get('password') !== data.get('confirm')) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    const result = await api('/api/members', 'POST', {
      firstName: data.get('firstName'),
      surname: data.get('surname'),
      organisation: data.get('organisation'),
      jobTitle: data.get('jobTitle'),
      country: data.get('country'),
      accountType: data.get('accountType'),
      email: String(data.get('email') || '').trim().toLowerCase(),
      password: data.get('password'),
      termsAccepted: data.get('termsAccepted') === 'on',
    })
    setBusy(false)
    if (result.ok) setDone(true)
    else setError(errorMessage(result, 'We could not create your account. Please check the details and try again.'))
  }

  if (done) {
    return (
      <Notice tone="success">
        Thank you. We have sent a verification link to your email address — please click it to activate your account,
        then sign in. (Institutional accounts are also reviewed by the Nigeria Lex team.)
      </Notice>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" name="firstName" required autoComplete="given-name" />
        <Field label="Surname" name="surname" required autoComplete="family-name" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisation" name="organisation" autoComplete="organization" />
        <Field label="Job title" name="jobTitle" autoComplete="organization-title" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Country" name="country" autoComplete="country-name" />
        <label className="grid gap-1.5 text-[13px] font-medium text-navy">
          Account type
          <select name="accountType" defaultValue="individual" className={inputClass}>
            <option value="individual">Individual</option>
            <option value="institutional">Institutional</option>
          </select>
        </label>
      </div>
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Password" name="password" type="password" required autoComplete="new-password" minLength={12} />
        <Field label="Confirm password" name="confirm" type="password" required autoComplete="new-password" minLength={12} />
      </div>
      <p className="-mt-2 text-[12px] text-slate">{PASSWORD_HINT} Please use a password you do not use anywhere else.</p>
      <label className="flex items-start gap-2 text-sm text-navy-ink">
        <input
          type="checkbox"
          name="termsAccepted"
          required
          className="mt-0.5 h-4 w-4 rounded-sm border-line text-green focus:ring-green"
        />
        <span>
          I accept the{' '}
          <Link href="/legal/terms-of-use" className="font-medium text-green">
            Terms of Use
          </Link>{' '}
          and have read the{' '}
          <Link href="/legal/privacy-policy" className="font-medium text-green">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      <button type="submit" disabled={busy} className={buttonClass}>
        {busy ? 'Creating account…' : 'Create account'}
      </button>
      {error && <Notice tone="error">{error}</Notice>}
    </form>
  )
}

/* ── Forgot / reset password ─────────────────────────────────────── */

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    const data = new FormData(e.currentTarget)
    await api('/api/members/forgot-password', 'POST', {
      email: String(data.get('email') || '').trim().toLowerCase(),
    })
    // Same message whether or not the address exists (no account enumeration).
    setBusy(false)
    setDone(true)
  }

  if (done) {
    return (
      <Notice tone="success">
        If an account exists for that email address, we have sent a link to reset the password. The link expires in one
        hour.
      </Notice>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <button type="submit" disabled={busy} className={buttonClass}>
        {busy ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    if (data.get('password') !== data.get('confirm')) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    const result = await api('/api/members/reset-password', 'POST', { token, password: data.get('password') })
    setBusy(false)
    if (result.ok) setDone(true)
    else setError(errorMessage(result, 'This reset link is invalid or has expired. Please request a new one.'))
  }

  if (done) {
    return (
      <Notice tone="success">
        Your password has been changed.{' '}
        <Link href="/account/login" className="font-medium text-green">
          Sign in
        </Link>
        .
      </Notice>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <Field label="New password" name="password" type="password" required autoComplete="new-password" minLength={12} />
      <Field label="Confirm new password" name="confirm" type="password" required autoComplete="new-password" minLength={12} />
      <p className="-mt-2 text-[12px] text-slate">{PASSWORD_HINT}</p>
      <button type="submit" disabled={busy} className={buttonClass}>
        {busy ? 'Saving…' : 'Set new password'}
      </button>
      {error && <Notice tone="error">{error}</Notice>}
    </form>
  )
}

/* ── Signed-in account management ────────────────────────────────── */

export function ProfileForm({
  member,
}: {
  member: { id: string | number; firstName?: string; surname?: string; organisation?: string; jobTitle?: string; country?: string; phone?: string }
}) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const data = new FormData(e.currentTarget)
    const result = await api(`/api/members/${member.id}`, 'PATCH', {
      firstName: data.get('firstName'),
      surname: data.get('surname'),
      organisation: data.get('organisation'),
      jobTitle: data.get('jobTitle'),
      country: data.get('country'),
      phone: data.get('phone'),
    })
    setBusy(false)
    setMessage(
      result.ok
        ? { tone: 'success', text: 'Your details have been updated.' }
        : { tone: 'error', text: errorMessage(result, 'Could not save your details.') },
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" name="firstName" required defaultValue={member.firstName} />
        <Field label="Surname" name="surname" required defaultValue={member.surname} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisation" name="organisation" defaultValue={member.organisation} />
        <Field label="Job title" name="jobTitle" defaultValue={member.jobTitle} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Country" name="country" defaultValue={member.country} />
        <Field label="Phone" name="phone" defaultValue={member.phone} />
      </div>
      <button type="submit" disabled={busy} className={buttonClass}>
        {busy ? 'Saving…' : 'Save details'}
      </button>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
    </form>
  )
}

export function ChangePasswordForm({ memberId }: { memberId: string | number }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const form = e.currentTarget
    const data = new FormData(form)
    if (data.get('password') !== data.get('confirm')) {
      setMessage({ tone: 'error', text: 'The two passwords do not match.' })
      return
    }
    setBusy(true)
    const result = await api(`/api/members/${memberId}`, 'PATCH', { password: data.get('password') })
    setBusy(false)
    if (result.ok) {
      form.reset()
      setMessage({ tone: 'success', text: 'Your password has been changed.' })
    } else {
      setMessage({ tone: 'error', text: errorMessage(result, 'Could not change your password.') })
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="New password" name="password" type="password" required autoComplete="new-password" minLength={12} />
        <Field label="Confirm new password" name="confirm" type="password" required autoComplete="new-password" minLength={12} />
      </div>
      <p className="-mt-2 text-[12px] text-slate">{PASSWORD_HINT}</p>
      <button type="submit" disabled={busy} className={buttonClass}>
        {busy ? 'Saving…' : 'Change password'}
      </button>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
    </form>
  )
}

export function LogoutButton() {
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await api('/api/members/logout', 'POST')
        window.location.href = '/'
      }}
      className="rounded-sm border border-line px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-navy hover:bg-mist disabled:opacity-60"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
