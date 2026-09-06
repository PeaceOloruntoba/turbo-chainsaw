import type { CollectionConfig } from 'payload'

/**
 * Individual firm pages are independent research profiles — not paid
 * advertising or "enhanced profiles". There is deliberately no field here
 * for sponsorship tier, featured placement, or paid ranking: firms cannot
 * buy prominence within this collection (see brief §9, §Independence).
 */
export const Firms: CollectionConfig = {
  slug: 'firms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'researchStatus', 'updatedAt'],
    group: 'Research',
    description:
      'Independent firm research profiles. Firms & Lawyers is public-facing as a "Research in progress" notice until entries here are published.',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      // Public visitors only ever see published research.
      return { researchStatus: { equals: 'published' } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar', description: 'URL-friendly identifier, e.g. "example-llp".' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Firm logo, used only on the firm\'s own research profile.' },
    },
    {
      name: 'overview',
      type: 'richText',
      admin: { description: 'Firm Overview — independent editorial summary of the firm.' },
    },
    {
      name: 'coreCapabilities',
      type: 'array',
      labels: { singular: 'Capability', plural: 'Core Capabilities' },
      fields: [{ name: 'capability', type: 'text', required: true }],
    },
    {
      name: 'practiceAreas',
      type: 'select',
      hasMany: true,
      options: [
        'Banking & Finance',
        'Capital Markets',
        'Corporate & M&A',
        'Private Equity',
        'Energy & Natural Resources',
        'Power & Infrastructure',
        'Projects & Project Finance',
        'Technology, Media & Telecommunications',
        'Competition',
        'Tax',
        'Employment',
        'Intellectual Property',
        'Real Estate',
        'Dispute Resolution & Arbitration',
        'Regulatory & Compliance',
      ],
      admin: {
        description: 'Only show categories Nigeria Lex is actively researching (brief §8).',
      },
    },
    {
      name: 'representativeExperience',
      type: 'array',
      labels: { singular: 'Matter', plural: 'Representative Experience' },
      fields: [
        { name: 'description', type: 'textarea', required: true },
        { name: 'year', type: 'number' },
      ],
    },
    {
      name: 'sectorStrengths',
      type: 'array',
      fields: [{ name: 'sector', type: 'text', required: true }],
    },
    {
      name: 'crossBorderExperience',
      type: 'richText',
    },
    {
      name: 'nigeriaLexAnalysis',
      type: 'richText',
      admin: {
        description: 'Editorial analysis — Nigeria Lex\'s independent assessment of the firm.',
      },
    },
    {
      name: 'researchStatus',
      type: 'select',
      required: true,
      defaultValue: 'pilot_2026',
      options: [
        { label: 'Pilot 2026 (in progress)', value: 'pilot_2026' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
