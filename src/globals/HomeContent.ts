import type { GlobalConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'

export const HomeContent: GlobalConfig = {
  slug: 'home-content',
  admin: { group: 'Page Content' },
  hooks: {
    afterChange: [
      ({ doc }) => {
        safeRevalidatePath('/')
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
      name: 'heroHeadline',
      type: 'text',
      required: true,
      defaultValue: 'Independent research. Market intelligence. Informed choice.',
    },
    {
      name: 'heroBody',
      type: 'textarea',
      required: true,
      defaultValue:
        "Nigeria Lex is an independent, research-led legal market intelligence platform providing credible insight into the capabilities, experience and expertise of Nigeria's corporate law firms and practitioners. We combine legal-market knowledge, evidence-led research and market intelligence to help businesses, investors, financial institutions and professional advisers make better-informed decisions about Nigeria's legal market.",
    },
    { name: 'ctaPrimaryLabel', type: 'text', defaultValue: 'Explore Our Research' },
    { name: 'ctaPrimaryHref', type: 'text', defaultValue: '/research' },
    { name: 'ctaSecondaryLabel', type: 'text', defaultValue: 'About Nigeria Lex' },
    { name: 'ctaSecondaryHref', type: 'text', defaultValue: '/about' },
    {
      name: 'pillars',
      label: 'What We Do',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      defaultValue: [
        {
          title: 'Legal Market Research',
          description: 'Independent research into Nigerian corporate law firms, practitioners and areas of expertise.',
          href: '/research',
        },
        {
          title: 'Market Intelligence',
          description:
            'Analysis of transactions, sectors, regulatory developments and trends affecting demand for legal services.',
          href: '/intelligence',
        },
        {
          title: 'Firms & Lawyers',
          description: 'Evidence-led profiles and recognition of firms and practitioners demonstrating significant capability.',
          href: '/firms',
        },
        {
          title: 'Institutional Intelligence',
          description:
            'Research designed to assist investors, financial institutions, corporates, international law firms and other organisations operating in or engaging with Nigeria.',
          href: '/intelligence',
        },
        {
          title: 'Reports & Insights',
          description: "Regular analysis of developments affecting Nigeria's corporate legal and investment environment.",
          href: '/intelligence',
        },
      ],
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'pilotTeaserLabel',
      type: 'text',
      defaultValue: 'Nigeria Lex Pilot Study 2026',
    },
    {
      name: 'pilotTeaserHeadline',
      type: 'text',
      defaultValue: 'Our inaugural pilot study is testing and refining the Nigeria Lex methodology.',
    },
  ],
}
