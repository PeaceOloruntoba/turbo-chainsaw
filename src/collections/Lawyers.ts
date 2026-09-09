import type { CollectionConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'

async function revalidateRelatedFirm({ doc, req }: { doc: any; req: any }) {
  const firmRef = doc?.firm
  if (!firmRef) return doc
  try {
    const firmId = typeof firmRef === 'object' ? firmRef.id : firmRef
    const firm = await req.payload.findByID({ collection: 'firms', id: firmId })
    if (firm?.slug) safeRevalidatePath(`/firms/${firm.slug}`)
  } catch {
    // Firm may have been deleted, or this is running outside a request
    // context (e.g. the seed script) — nothing to revalidate either way.
  }
  return doc
}

export const Lawyers: CollectionConfig = {
  slug: 'lawyers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'firm', 'title', 'updatedAt'],
    group: 'Research',
  },
  hooks: {
    afterChange: [revalidateRelatedFirm],
    afterDelete: [revalidateRelatedFirm],
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
        'Private Equity & Venture Capital',
        'Energy & Natural Resources',
        'Power & Infrastructure',
        'Projects & Project Finance',
        'Technology, Media & Telecommunications',
        'Competition & Antitrust',
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
