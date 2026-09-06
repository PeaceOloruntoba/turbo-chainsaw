'use client'

import { useState, type FormEvent } from 'react'

const AREAS_OF_INTEREST = [
  'Legal Market Research',
  'Firms & Lawyers',
  'Market Intelligence',
  'Reports & Briefings',
  'Pilot 2026',
  'Events',
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function SubscribeForm() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')

    const form = event.currentTarget
    const data = new FormData(form)

    const payload = {
      firstName: data.get('firstName'),
      surname: data.get('surname'),
      organisation: data.get('organisation'),
      jobTitle: data.get('jobTitle'),
      email: data.get('email'),
      country: data.get('country'),
      areasOfInterest: data.getAll('areasOfInterest'),
      consented: data.get('consented') === 'on',
    }

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-sm border border-line bg-white p-6">
        <p className="font-serif text-lg text-navy">Thank you for subscribing.</p>
        <p className="mt-2 text-sm text-slate">
          You will receive Nigeria Lex research, market intelligence and briefing invitations at
          the email address you provided. You may unsubscribe at any time.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Surname" name="surname" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisation" name="organisation" />
        <Field label="Job title" name="jobTitle" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Country" name="country" />
      </div>

      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-navy">Areas of interest</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {AREAS_OF_INTEREST.map((area) => (
            <label key={area} className="flex items-center gap-2 text-sm text-navy-ink">
              <input
                type="checkbox"
                name="areasOfInterest"
                value={area}
                className="h-4 w-4 rounded-sm border-line text-green focus:ring-green"
              />
              {area}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-sm text-navy-ink">
        <input
          type="checkbox"
          name="consented"
          required
          className="mt-0.5 h-4 w-4 rounded-sm border-line text-green focus:ring-green"
        />
        <span>
          I consent to receive communications from Nigeria Lex and understand I can unsubscribe
          at any time.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-fit rounded-sm bg-green px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting…' : 'Subscribe'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-700">
          Something went wrong sending your details. Please try again, or email
          info@nigerialex.com.
        </p>
      )}
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="grid gap-1.5 text-[13px] font-medium text-navy">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] font-normal text-navy-ink outline-none focus:border-green"
      />
    </label>
  )
}
