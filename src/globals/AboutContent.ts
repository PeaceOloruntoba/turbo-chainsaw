import type { GlobalConfig } from 'payload'
import { safeRevalidatePath } from '../utilities/revalidate'

export const AboutContent: GlobalConfig = {
  slug: 'about-content',
  admin: { group: 'Page Content' },
  hooks: {
    afterChange: [
      ({ doc }) => {
        safeRevalidatePath('/about')
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
      defaultValue: "Better information about Nigeria's legal market",
    },
    {
      name: 'whoWeAre',
      type: 'textarea',
      required: true,
      defaultValue:
        "Nigeria Lex provides independent research and market intelligence on Nigeria's corporate legal market, helping investors, businesses, financial institutions and professional advisers make informed decisions about legal capability and market conditions.\n\nNigeria has one of Africa's largest and most sophisticated legal markets. Yet reliable, independently researched information about the capabilities and experience of its corporate law firms and practitioners can be difficult to obtain, particularly for organisations entering the market or instructing Nigerian counsel for the first time.\n\nNigeria Lex was established to address that information gap.\n\nWe research and analyse the Nigerian corporate legal market to provide independent insight into firms, practitioners, transactions, sectors and emerging areas of legal expertise.",
    },
    {
      name: 'purpose',
      type: 'textarea',
      required: true,
      defaultValue:
        'Our purpose is not simply to identify prominent names. We seek to understand where demonstrable capability exists, how that capability has been developed, and where particular expertise may be found.',
    },
    {
      name: 'leadership',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', defaultValue: 'Paul Onifade' },
        { name: 'title', type: 'text', defaultValue: 'Founder & Editor-in-Chief' },
        {
          name: 'biography',
          type: 'textarea',
          defaultValue:
            "Paul Onifade is a Solicitor Advocate of the Senior Courts of England and Wales and Founder & Editor-in-Chief of Nigeria Lex. He leads the platform's editorial vision, legal-market strategy and institutional development.",
        },
      ],
    },
    {
      name: 'ownershipText',
      type: 'textarea',
      required: true,
      defaultValue: 'Nigeria Lex is owned and published by Kaye & Crowther Limited.',
    },
    {
      name: 'researchPartnerText',
      type: 'textarea',
      required: true,
      defaultValue:
        'SBM Intelligence supports Nigeria Lex in research design, data verification, analysis and market intelligence. SBM Intelligence is an Africa-focused research and strategic intelligence firm with expertise across the socio-political, economic, security and business environments in West Africa.',
    },
  ],
}
