import type { GlobalConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'
import { isContentTeam } from '../access'

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
    update: ({ req: { user } }) => isContentTeam(user),
  },
  fields: [
    {
      name: 'intro',
      label: 'What the Pilot Is',
      type: 'textarea',
      required: true,
      defaultValue:
        "The Nigeria Lex Pilot Study 2026 will test and refine our research methodology while developing an independent evidence base on selected areas of Nigeria's corporate legal market. The pilot is intended to provide investors, businesses, financial institutions, professional advisers and other institutional users with clearer insight into legal capability, experience and market conditions.",
    },
    {
      name: 'whatIsBeingResearched',
      type: 'textarea',
      defaultValue:
        "A selected range of practice areas within Nigeria's corporate legal market, chosen for their significance to institutional users of legal services. Practice areas under research will be confirmed as the pilot progresses and published on the Firms & Lawyers section as they become available.",
    },
    {
      name: 'methodologyNote',
      type: 'textarea',
      defaultValue:
        'The pilot follows the Nigeria Lex research process: research, verification, analysis, editorial review and publication.',
    },
    {
      name: 'whyItMatters',
      type: 'textarea',
      defaultValue:
        "Reliable, independently researched information about legal capability in Nigeria is difficult to obtain. The pilot's findings are intended to help investors, businesses, financial institutions and professional advisers make more informed decisions when engaging Nigerian legal counsel.",
    },
    {
      name: 'whoCanParticipate',
      type: 'textarea',
      defaultValue:
        "Nigerian law firms and practitioners are invited to participate in the underlying research. Investors, corporates, financial institutions, professional advisers and other institutional users of Nigerian legal services are separately invited to contribute market feedback and insight.",
    },
    {
      name: 'timeline',
      label: 'Timetable',
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
    {
      name: 'lagosPresentationNote',
      label: 'Proposed Lagos Presentation',
      type: 'textarea',
      defaultValue:
        'Nigeria Lex proposes to present initial pilot findings in Lagos in the week commencing 16 November 2026. The date and venue remain proposed and subject to confirmation as research progresses.',
    },
    {
      name: 'howToEngageIntro',
      label: 'How to Engage',
      type: 'textarea',
      defaultValue:
        'Law firms, institutional users and other market participants can engage with the Pilot Study 2026 as set out below.',
    },
  ],
}
