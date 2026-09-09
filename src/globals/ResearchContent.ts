import type { GlobalConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'

export const ResearchContent: GlobalConfig = {
  slug: 'research-content',
  admin: { group: 'Page Content' },
  hooks: {
    afterChange: [
      ({ doc }) => {
        safeRevalidatePath('/research')
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
      name: 'tagline',
      type: 'text',
      defaultValue: 'Evidence before reputation',
    },
    {
      name: 'methodologyText',
      type: 'textarea',
      required: true,
      defaultValue:
        "Nigeria Lex seeks to provide an independent assessment of Nigeria's corporate legal market based upon research rather than reputation alone. Our research considers evidence of demonstrated capability, significant work, practitioner expertise, market experience and other relevant indicators.",
    },
    {
      name: 'howWeResearch',
      type: 'array',
      label: 'How We Research (source list)',
      defaultValue: [
        { item: 'Submissions from participating law firms' },
        { item: 'Significant and representative transactions' },
        { item: 'Publicly available transaction and regulatory information' },
        { item: 'Independent market research' },
        { item: 'Interviews with practitioners' },
        { item: 'Consultation with clients and users of legal services' },
        { item: 'Sector and practice-area analysis' },
        { item: 'Peer and market feedback' },
        { item: 'Verification of submitted information where practicable' },
      ],
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    {
      name: 'noSingleFactorText',
      type: 'text',
      defaultValue: 'No single factor determines a Nigeria Lex assessment.',
    },
    {
      name: 'criteria',
      label: 'What We Assess',
      type: 'array',
      defaultValue: [
        { label: 'Experience', detail: 'The nature, complexity and significance of work undertaken.' },
        { label: 'Expertise', detail: 'Demonstrated specialist capability within a practice area or sector.' },
        { label: 'Practitioners', detail: 'Depth and quality of relevant practitioner experience.' },
        {
          label: 'Clients and Markets',
          detail: 'Experience advising sophisticated domestic and international clients.',
        },
        {
          label: 'Transactions',
          detail: 'Participation in significant or representative transactions and mandates.',
        },
        { label: 'Sector Knowledge', detail: 'Evidence of sustained expertise within relevant industries.' },
        {
          label: 'Cross-Border Capability',
          detail: 'Experience involving international clients, counterparties, advisers and transactions.',
        },
        { label: 'Market Evidence', detail: 'Information obtained through independent consultation and research.' },
      ],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'detail', type: 'textarea', required: true },
      ],
    },
    {
      name: 'process',
      label: 'Research Process (internal stages)',
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
      defaultValue:
        "Participation in Nigeria Lex research is free. A firm's decision whether to advertise, sponsor an event, subscribe to Nigeria Lex Intelligence or enter into another commercial relationship with Nigeria Lex has no bearing upon its assessment, inclusion or recognition.",
    },
    {
      name: 'correctionsText',
      label: 'Corrections and Review',
      type: 'textarea',
      defaultValue:
        'Nigeria Lex seeks accuracy and fairness. Firms and practitioners may bring factual inaccuracies to our attention. Requests for correction will be considered where supported by appropriate evidence. A request for review does not guarantee alteration of an editorial assessment.',
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
