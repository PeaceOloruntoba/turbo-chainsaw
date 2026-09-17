'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

type SubmissionType =
  | 'law_firm'
  | 'corporate_counsel'
  | 'investor'
  | 'professional_adviser'
  | 'other_institutional'
  | 'general'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const SUBMISSION_TYPE_OPTIONS: Array<{ value: SubmissionType; label: string }> = [
  { value: 'law_firm', label: 'Law firm — participate in research' },
  { value: 'corporate_counsel', label: 'Corporate / General Counsel — contribute market feedback' },
  { value: 'investor', label: 'Investor / Financial Institution — contribute market insight' },
  { value: 'professional_adviser', label: 'Professional Adviser — contribute market insight' },
  { value: 'other_institutional', label: 'Other Institutional Participant' },
  { value: 'general', label: 'General Research Enquiry' },
]

/** Every type other than the law-firm and general-enquiry routes is treated
 * as an institutional participant for the purpose of which fields are shown. */
function isInstitutional(type: SubmissionType) {
  return (
    type === 'corporate_counsel' ||
    type === 'investor' ||
    type === 'professional_adviser' ||
    type === 'other_institutional'
  )
}

export function ResearchSubmissionForm({
  defaultType = 'law_firm',
}: {
  defaultType?: SubmissionType
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [submissionType, setSubmissionType] = useState<SubmissionType>(defaultType)

  const institutional = isInstitutional(submissionType)
  const isGeneral = submissionType === 'general'
  const isLawFirm = submissionType === 'law_firm'

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
      role: data.get('role') || undefined,
      practiceAreasOrSector: data.get('practiceAreasOrSector'),
      message: data.get('message'),
      mayContactConfidentially: data.get('mayContactConfidentially') === 'on',
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
    <form onSubmit={handleSubmit} className="grid min-w-0 gap-5">
      <label className="grid gap-1.5 text-[13px] font-medium text-navy">
        Submission type
        <select
          name="submissionType"
          value={submissionType}
          onChange={(event) => setSubmissionType(event.target.value as SubmissionType)}
          className="w-full min-w-0 max-w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] text-navy-ink outline-none focus:border-green"
        >
          {SUBMISSION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <TextField label="Organisation" name="organisationName" required />
        <TextField label="Contact name" name="contactName" required />
      </div>
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <TextField label="Contact email" name="contactEmail" type="email" required />
        <TextField label="Contact phone" name="contactPhone" />
      </div>

      {institutional && <TextField label="Role" name="role" />}

      {(isLawFirm || institutional) && (
        <TextField
          label={isLawFirm ? 'Relevant practice area(s) or sector' : 'Sector'}
          name="practiceAreasOrSector"
        />
      )}

      <label className="grid gap-1.5 text-[13px] font-medium text-navy">
        {isLawFirm ? 'Submission information' : institutional ? 'Nature of contribution' : 'Message'}
        <textarea
          name="message"
          rows={4}
          className="w-full min-w-0 max-w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] text-navy-ink outline-none focus:border-green"
        />
      </label>

      {institutional && (
        <label className="flex items-start gap-2 text-sm text-navy-ink">
          <input
            type="checkbox"
            name="mayContactConfidentially"
            className="mt-0.5 h-4 w-4 rounded-sm border-line text-green focus:ring-green"
          />
          <span>Nigeria Lex may contact me confidentially for research purposes.</span>
        </label>
      )}

      {isGeneral && (
        <p className="text-[12px] leading-relaxed text-slate">
          For research participation or institutional contributions, please select the relevant
          category above so the right team can follow up.
        </p>
      )}

      <p className="text-[12px] leading-relaxed text-slate">
        Information submitted to Nigeria Lex will be handled in accordance with our{' '}
        <Link href="/legal/privacy-policy" className="font-medium text-green">
          Privacy Policy
        </Link>{' '}
        and applicable data protection requirements. Please do not submit legally privileged or
        highly sensitive confidential information through this form.
      </p>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-sm bg-green px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep disabled:opacity-60 sm:w-fit"
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
