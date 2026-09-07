import type { GlobalConfig } from 'payload'

export const HomeContent: GlobalConfig = {
  slug: 'home-content',
  admin: { group: 'Page Content' },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'heroHeadline',
      type: 'text',
      required: true,
      defaultValue: "Independent intelligence on Nigeria's corporate legal market.",
    },
    {
      name: 'heroBody',
      type: 'textarea',
      required: true,
      defaultValue:
        "Nigeria Lex provides independent research and intelligence on the capabilities, experience and expertise of Nigeria's corporate law firms and practitioners. We combine legal-market knowledge, evidence-led research and market intelligence to help investors, businesses, financial institutions and professional advisers make informed decisions about Nigeria's legal market.",
    },
    { name: 'ctaPrimaryLabel', type: 'text', defaultValue: 'Explore Our Research' },
    { name: 'ctaSecondaryLabel', type: 'text', defaultValue: 'Our Methodology' },
    {
      name: 'pillars',
      type: 'array',
      minRows: 4,
      maxRows: 4,
      defaultValue: [
        {
          title: 'Legal Market Research',
          description: "Independent research and analysis of Nigeria's corporate legal market.",
          href: '/research',
        },
        {
          title: 'Firms & Lawyers',
          description: 'Evidence-led information about firms, practitioners and areas of expertise.',
          href: '/firms',
        },
        {
          title: 'Market Intelligence',
          description:
            "Analysis of transactions, sectors and developments affecting Nigeria's legal and investment environment.",
          href: '/intelligence',
        },
        {
          title: 'Reports & Briefings',
          description: 'Research and intelligence designed for institutional decision-makers.',
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
