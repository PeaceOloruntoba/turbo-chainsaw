'use client'

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ResearchSubmissionForm({
  defaultType = 'law_firm',
}: {
  defaultType?: 'law_firm' | 'institutional' | 'general'
}) {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')

    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      submissionType: data.get('submissionType'),
      organisationName: data.get('organisationName'),
      contactName: data.get('contactName'),
      contactEmail: data.get('contactEmail'),
      contactPhone: data.get('contactPhone'),
      practiceAreasOrSector: data.get('practiceAreasOrSector'),
      message: data.get('message'),
    }

    try {
      const res = await fetch('/api/research-submissions', {
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
        <p className="font-serif text-lg text-navy">Submission received.</p>
        <p className="mt-2 text-sm text-slate">
          Thank you. The Nigeria Lex research team will review your submission and, where
          relevant, follow up by email.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="grid gap-1.5 text-[13px] font-medium text-navy">
        Submission type
        <select
          name="submissionType"
          defaultValue={defaultType}
          className="rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] text-navy-ink outline-none focus:border-green"
        >
          <option value="law_firm">Law firm — participate in research</option>
          <option value="institutional">Institutional user — contribute</option>
          <option value="general">General research submission</option>
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Organisation name" name="organisationName" required />
        <TextField label="Contact name" name="contactName" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Contact email" name="contactEmail" type="email" required />
        <TextField label="Contact phone" name="contactPhone" />
      </div>
      <TextField
        label="Relevant practice area(s) or sector"
        name="practiceAreasOrSector"
      />

      <label className="grid gap-1.5 text-[13px] font-medium text-navy">
        Message
        <textarea
          name="message"
          rows={4}
          className="rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] text-navy-ink outline-none focus:border-green"
        />
      </label>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-fit rounded-sm bg-green px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Submit securely'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-700">
          Something went wrong sending your submission. Please try again, or email
          research@nigerialex.com.
        </p>
      )}
    </form>
  )
}

function TextField({
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
