import type { GlobalConfig } from 'payload'

export const ResearchContent: GlobalConfig = {
  slug: 'research-content',
  admin: { group: 'Page Content' },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'methodologyText',
      type: 'textarea',
      required: true,
      defaultValue:
        'Nigeria Lex research is evidence-led. We assess firms and practitioners against a consistent set of criteria, verify our findings independently, and subject every conclusion to editorial review before publication.',
    },
    {
      name: 'criteria',
      type: 'array',
      defaultValue: [
        { label: 'Experience' },
        { label: 'Expertise' },
        { label: 'Significant transactions' },
        { label: 'Practitioner capability' },
        { label: 'Sector knowledge' },
        { label: 'Cross-border experience' },
        { label: 'Market evidence' },
        { label: 'Client / market feedback' },
      ],
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'process',
      type: 'array',
      defaultValue: [
        { step: 'Research', detail: 'Gathering evidence on firms, practitioners, transactions and sector activity.' },
        { step: 'Verification', detail: 'Checking findings against independent sources and market evidence.' },
        { step: 'Analysis', detail: 'Assessing capability, experience and market standing against our criteria.' },
        { step: 'Editorial Review', detail: 'Independent editorial scrutiny before any material is published.' },
        { step: 'Publication', detail: 'Findings are published on Nigeria Lex, subject to ongoing correction and review.' },
      ],
      fields: [
        { name: 'step', type: 'text', required: true },
        { name: 'detail', type: 'textarea', required: true },
      ],
    },
    {
      name: 'researchIndependenceText',
      type: 'textarea',
      required: true,
      defaultValue: 'Participation and recognition in Nigeria Lex research are not conditional upon payment.',
    },
    {
      name: 'participateIntro',
      type: 'textarea',
      required: true,
      defaultValue:
        'Law firms and institutional users can submit information for consideration as part of Nigeria Lex research using the secure form below. Research deadlines and downloadable submission forms will be published here ahead of each research cycle.',
    },
  ],
}
