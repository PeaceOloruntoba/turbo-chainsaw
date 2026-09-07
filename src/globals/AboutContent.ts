import type { GlobalConfig } from 'payload'

export const AboutContent: GlobalConfig = {
  slug: 'about-content',
  admin: { group: 'Page Content' },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'whoWeAre',
      type: 'textarea',
      required: true,
      defaultValue:
        "Nigeria Lex is an independent, research-led legal market intelligence platform established to improve the quality, accessibility and international visibility of information about Nigeria's corporate legal market.",
    },
    {
      name: 'purpose',
      type: 'textarea',
      required: true,
      defaultValue:
        "Institutional users of Nigerian legal services — investors, financial institutions, development finance institutions, multinational corporations and international law firms among them — often make decisions about Nigerian legal counsel without access to independent, evidence-led information. Nigeria Lex exists to close that information gap: combining legal-market knowledge, rigorous research and market intelligence so that institutional users can make better-informed decisions about who they instruct and why.",
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
            'A full professional biography for Paul Onifade will be published here shortly.',
        },
      ],
    },
    {
      name: 'ownershipText',
      type: 'textarea',
      required: true,
      defaultValue: 'Nigeria Lex is an initiative of Kaye & Crowther Limited.',
    },
    {
      name: 'researchPartnerText',
      type: 'textarea',
      required: true,
      defaultValue:
        "SBM Intelligence acts as Nigeria Lex's Strategic Research & Intelligence Partner, contributing research and data expertise to the Nigeria Lex methodology. A fuller description of this partnership will be published following execution of the collaboration agreement.",
    },
  ],
}
