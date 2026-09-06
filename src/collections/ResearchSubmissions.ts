import type { CollectionConfig } from 'payload'

/**
 * Secure electronic submission channel for law firms (Research §Participate,
 * Pilot 2026 §"Law Firms – Participate") and institutional users
 * (Pilot 2026 §"Institutional Users – Contribute"). Submissions are never
 * publicly readable — only Nigeria Lex staff can view them, matching the
 * "secure electronic submission" requirement in the brief.
 */
export const ResearchSubmissions: CollectionConfig = {
  slug: 'research-submissions',
  admin: {
    useAsTitle: 'organisationName',
    defaultColumns: ['organisationName', 'submissionType', 'status', 'createdAt'],
    group: 'Audience',
    description: 'Secure research participation and contribution submissions.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // public submissions from Research / Pilot 2026 forms
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'submissionType',
      type: 'select',
      required: true,
      options: [
        { label: 'Law firm — Participate in research', value: 'law_firm' },
        { label: 'Institutional user — Contribute', value: 'institutional' },
        { label: 'General research submission', value: 'general' },
      ],
    },
    { name: 'organisationName', type: 'text', required: true },
    { name: 'contactName', type: 'text', required: true },
    { name: 'contactEmail', type: 'email', required: true },
    { name: 'contactPhone', type: 'text' },
    {
      name: 'practiceAreasOrSector',
      type: 'text',
      admin: { description: 'Free text: relevant practice area(s) or sector.' },
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'attachment',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Supporting document, e.g. firm submission form.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'received',
      options: [
        { label: 'Received', value: 'received' },
        { label: 'Under review', value: 'under_review' },
        { label: 'Actioned', value: 'actioned' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
