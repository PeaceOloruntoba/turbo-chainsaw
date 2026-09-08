import type { CollectionConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventDate', 'venue'],
    group: 'Content',
    description: 'Roundtables, investor briefings, sector forums and research presentations.',
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        safeRevalidatePath('/events')
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        safeRevalidatePath('/events')
        return doc
      },
    ],
  },
  access: {
    read: () => true,
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
      name: 'eventDate',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'venue', type: 'text', required: true },
    { name: 'description', type: 'richText' },
    {
      name: 'speakers',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'organisation', type: 'text' },
      ],
    },
    {
      name: 'registrationUrl',
      type: 'text',
      admin: { description: 'External or internal registration link.' },
    },
  ],
}
