import type { GlobalConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'

export const Pilot2026Content: GlobalConfig = {
  slug: 'pilot-2026-content',
  admin: { group: 'Page Content' },
  hooks: {
    afterChange: [
      ({ doc }) => {
        safeRevalidatePath('/pilot-2026')
        return doc
      },
    ],
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      defaultValue:
        "Nigeria Lex is undertaking an inaugural pilot study examining selected areas of Nigeria's corporate legal market. The pilot will test and refine the Nigeria Lex research methodology through engagement with law firms, practitioners, investors and institutional users.",
    },
    {
      name: 'objectives',
      type: 'textarea',
      defaultValue:
        "To test and refine Nigeria Lex's research methodology ahead of full-scale research, and to establish the platform's initial evidence base.",
    },
    {
      name: 'researchScope',
      type: 'textarea',
      defaultValue:
        "A selected range of practice areas within Nigeria's corporate legal market, chosen for their significance to institutional users of legal services.",
    },
    {
      name: 'methodologyNote',
      type: 'textarea',
      defaultValue:
        'The pilot follows the Nigeria Lex research process: research, verification, analysis, editorial review and publication.',
    },
    {
      name: 'practiceAreasNote',
      type: 'textarea',
      defaultValue:
        'To be confirmed as pilot research progresses and will be published on the Firms & Lawyers section as it becomes available.',
    },
    {
      name: 'timeline',
      type: 'array',
      defaultValue: [
        { label: 'Research & engagement', detail: 'Firm and practitioner research, verification and market engagement.' },
        { label: 'Analysis & editorial review', detail: 'Independent analysis and editorial review of pilot findings.' },
        {
          label: 'Lagos presentation',
          detail:
            'Proposed presentation and launch: Lagos, week commencing 16 November 2026 (subject to research progress).',
        },
      ],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'detail', type: 'textarea', required: true },
      ],
    },
  ],
}
