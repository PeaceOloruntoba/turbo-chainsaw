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
        "Nigeria has one of Africa's largest and most sophisticated legal markets. Yet reliable, independently researched information about the capabilities and experience of its corporate law firms and practitioners can be difficult to obtain, particularly for organisations entering the market or instructing Nigerian counsel for the first time.\n\nNigeria Lex was established to address that information gap.\n\nWe research and analyse the Nigerian corporate legal market to provide independent insight into firms, practitioners, transactions, sectors and emerging areas of legal expertise.",
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
            'Nigeria Lex was conceived by Paul Onifade, Solicitor Advocate of the Senior Courts of England and Wales, who serves as its Founder and Editor-in-Chief.',
        },
      ],
    },
    {
      name: 'ownershipText',
      type: 'textarea',
      required: true,
      defaultValue: 'Nigeria Lex is promoted and published by Kaye & Crowther Limited.',
    },
    {
      name: 'researchPartnerText',
      type: 'textarea',
      required: true,
      defaultValue:
        'Strategic Research & Intelligence Partner: SBM Intelligence — an Africa-focused market intelligence, security intelligence, and strategic consulting firm. It is a leading provider of strategic research and analysis, delivering actionable insights into the socio-political, economic, security, and business environments across West Africa through evidence-based research, data analytics, and practical policy recommendations.',
    },
  ],
}
