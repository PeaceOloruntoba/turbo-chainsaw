import type { CollectionConfig } from 'payload'

export const Lawyers: CollectionConfig = {
  slug: 'lawyers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'firm', 'title', 'updatedAt'],
    group: 'Research',
  },
  access: {
    read: () => true,
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
      admin: { position: 'sidebar' },
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'title', type: 'text', admin: { description: 'e.g. Partner, Senior Associate.' } },
    { name: 'biography', type: 'richText' },
    {
      name: 'firm',
      type: 'relationship',
      relationTo: 'firms',
      admin: { position: 'sidebar' },
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
    },
    {
      name: 'sectorKnowledge',
      type: 'array',
      fields: [{ name: 'sector', type: 'text', required: true }],
    },
    {
      name: 'experienceYears',
      type: 'number',
      admin: { description: 'Years of active practice.' },
    },
  ],
}
