import type { CollectionConfig } from 'payload'

export const Intelligence: CollectionConfig = {
  slug: 'intelligence',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'isSubscriberOnly'],
    group: 'Content',
    description: 'Nigeria Lex Intelligence — articles, reports, briefings and analysis.',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { publishedAt: { less_than_equal: new Date().toISOString() } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        'Article',
        'Report',
        'Briefing',
        'Sector Briefing',
        'Transaction Intelligence',
        'Regulatory Intelligence',
        'Investor Briefing',
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: { description: 'Shown on listing pages and as the article/report standfirst.' },
    },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'isSubscriberOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Restrict the full item to Nigeria Lex subscribers. Summary always remains public.',
      },
    },
    {
      name: 'pdfAttachment',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional downloadable PDF (full report / briefing document).' },
    },
  ],
}
