// import { config as loadEnv } from 'dotenv'
// loadEnv()

import { getPayload } from 'payload'
import { paragraphsToLexical } from './lexical'

/**
 * Populates the CMS with sensible placeholder content so the site is fully
 * navigable and editable from day one. Everything this script writes is
 * meant to be edited or replaced in /admin — none of it is final copy, and
 * the Legal Pages content is explicitly marked as an unreviewed draft.
 *
 * Usage:  npm run seed
 * Safe to re-run: it updates existing documents by slug rather than
 * duplicating them.
 */

const LEGAL_PAGES: Array<{
  slug: string
  title: string
  paragraphs: string[]
}> = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    paragraphs: [
      'This Privacy Policy explains, in outline, how Nigeria Lex collects, uses and protects personal information submitted through this website — including newsletter subscriptions and research submissions.',
      'Nigeria Lex collects information you provide directly (such as your name, email address, organisation and job title) when you subscribe to Nigeria Lex Briefing or submit a research contribution. This information is used to send you requested communications, to administer your subscription, and to support Nigeria Lex research.',
      'Nigeria Lex does not sell personal information to third parties. Information may be shared with service providers who help operate this website (such as hosting and email delivery providers) under appropriate confidentiality obligations.',
      'You may request access to, correction of, or deletion of your personal information, and may unsubscribe from communications at any time, by contacting info@nigerialex.com.',
      'This is placeholder text pending review by Nigeria Lex\u2019s legal counsel and confirmation of applicable data-protection requirements (including Nigeria\u2019s NDPA where relevant). It should not be relied upon as final.',
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    paragraphs: [
      'This Cookie Policy explains, in outline, how Nigeria Lex uses cookies and similar technologies on this website.',
      'Nigeria Lex uses strictly necessary cookies required for the website and admin system to function (for example, to keep staff logged in to the CMS). The website may also use analytics cookies to understand how visitors use the site, in order to improve it.',
      'You can control or disable cookies through your browser settings. Disabling strictly necessary cookies may affect the functionality of parts of the site, including the admin system.',
      'This is placeholder text pending review by Nigeria Lex\u2019s legal counsel and finalisation of the site\u2019s actual analytics and cookie usage. It should not be relied upon as final.',
    ],
  },
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    paragraphs: [
      'These Terms of Use govern access to and use of the Nigeria Lex website. By using this website, you agree to these terms in outline.',
      'Content published by Nigeria Lex, including research, analysis, reports and briefings, is provided for general informational purposes and does not constitute legal advice. Nigeria Lex research reflects independent editorial judgement based on available evidence at the time of publication.',
      'All content on this website, including text, graphics and the Nigeria Lex name and logo, is the property of Kaye & Crowther Limited or its licensors, and may not be reproduced without permission, except as permitted by law.',
      'Nigeria Lex reserves the right to update or correct published content, consistent with its Corrections Policy.',
      'This is placeholder text pending review by Nigeria Lex\u2019s legal counsel. It should not be relied upon as final.',
    ],
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    paragraphs: [
      'Nigeria Lex publishes independent research and intelligence concerning Nigeria\u2019s corporate legal market. This content is provided for general informational purposes only and does not constitute legal, financial or investment advice.',
      'While Nigeria Lex research is evidence-led and subject to verification and editorial review, Nigeria Lex makes no warranty as to the completeness, accuracy or currency of any information published, and accepts no liability for decisions made in reliance on it.',
      'Inclusion of a firm or practitioner in Nigeria Lex research is not an endorsement, and exclusion should not be read as an adverse assessment; research coverage expands over time as detailed in our Research Methodology.',
      'This is placeholder text pending review by Nigeria Lex\u2019s legal counsel. It should not be relied upon as final.',
    ],
  },
  {
    slug: 'editorial-independence',
    title: 'Editorial Independence',
    paragraphs: [
      'Nigeria Lex is committed to editorial independence in all of its research and published content.',
      'Nigeria Lex does not charge law firms or practitioners for consideration, inclusion or recognition in its research. Sponsorship, subscriptions, partnerships and other commercial relationships do not determine research outcomes, rankings, or editorial coverage.',
      'Research findings are subject to Nigeria Lex\u2019s methodology, including verification against independent sources and editorial review, before publication. Editorial decisions rest with Nigeria Lex\u2019s Editor-in-Chief and research team.',
      'Any commercial relationship relevant to a piece of research or content will, where appropriate, be disclosed.',
      'This is placeholder text pending review by Nigeria Lex\u2019s legal counsel. It should not be relied upon as final.',
    ],
  },
  {
    slug: 'corrections-policy',
    title: 'Corrections Policy',
    paragraphs: [
      'Nigeria Lex is committed to the accuracy of its published research and intelligence, and welcomes requests for correction.',
      'If you believe published content contains a factual error, please contact editorial@nigerialex.com with details of the item and the correction requested. Nigeria Lex will review the request and respond within a reasonable time.',
      'Where a correction is warranted, Nigeria Lex will update the relevant content and, where appropriate, note that a correction has been made.',
      'This is placeholder text pending review by Nigeria Lex\u2019s legal counsel and formal adoption of internal correction procedures. It should not be relied upon as final.',
    ],
  },
]

const SAMPLE_INTELLIGENCE: Array<{
  title: string
  slug: string
  category: string
  summary: string
  paragraphs: string[]
  isSubscriberOnly?: boolean
}> = [
  {
    title: 'Welcome to Nigeria Lex',
    slug: 'welcome-to-nigeria-lex',
    category: 'Briefing',
    summary:
      "Nigeria Lex launches as an independent, research-led platform for Nigeria's corporate legal market.",
    paragraphs: [
      "Nigeria Lex has launched as an independent, research-led legal market intelligence platform focused on Nigeria's corporate legal market. Our purpose is to provide credible, evidence-led information concerning Nigerian corporate law firms, practitioners, transactions, sectors and market developments to investors, financial institutions, multinational corporations and other institutional users of Nigerian legal services.",
      "Unlike directory or ranking products that charge firms for inclusion or prominence, Nigeria Lex does not charge law firms or practitioners for consideration, inclusion or recognition in its research. Sponsorship, subscriptions and other commercial relationships do not determine research outcomes — see our Editorial Independence policy for more detail.",
      'Over the coming months, Nigeria Lex will publish findings from its inaugural Pilot Study 2026, building toward a structured, searchable database of firms and practitioners. Subscribe to Nigeria Lex Briefing to be notified as new research is published.',
    ],
  },
  {
    title: 'Nigeria Lex Announces Pilot Study 2026',
    slug: 'nigeria-lex-announces-pilot-study-2026',
    category: 'Article',
    summary:
      "Nigeria Lex's inaugural pilot study will test and refine its research methodology ahead of a proposed Lagos presentation in November 2026.",
    paragraphs: [
      "Nigeria Lex is undertaking an inaugural pilot study examining selected areas of Nigeria's corporate legal market. The pilot will test and refine the Nigeria Lex research methodology through engagement with law firms, practitioners, investors and institutional users.",
      'The pilot follows the Nigeria Lex research process in full: research, verification, analysis, editorial review and publication. Participating practice areas will be confirmed and published as pilot research progresses.',
      'Nigeria Lex is proposing to present initial pilot findings in Lagos, in the week commencing 16 November 2026, subject to research progress. Law firms and institutional users interested in participating can find submission details on the Pilot 2026 and Research pages.',
    ],
  },
]

const SAMPLE_EVENTS: Array<{
  title: string
  slug: string
  eventDate: string
  venue: string
  paragraphs: string[]
  speakers: Array<{ name: string; role?: string; organisation?: string }>
}> = [
  {
    title: 'Nigeria Lex Pilot 2026 — Lagos Launch Briefing',
    slug: 'nigeria-lex-pilot-2026-lagos-launch-briefing',
    eventDate: '2026-11-17T10:00:00.000Z',
    venue: 'Lagos, Nigeria — venue to be confirmed',
    paragraphs: [
      "A presentation of initial findings from the Nigeria Lex Pilot Study 2026, proposed for the week commencing 16 November 2026 in Lagos, subject to research progress. Details of the venue and programme will be confirmed closer to the date.",
    ],
    speakers: [{ name: 'Paul Onifade', role: 'Founder & Editor-in-Chief', organisation: 'Nigeria Lex' }],
  },
]

/**
 * A single hidden demo Firm + Lawyer pair, kept in "Pilot 2026" status so
 * the public `read` access rule on Firms (researchStatus === 'published')
 * excludes it from the live site entirely. This exists only so Nigeria Lex
 * staff can see the Firms/Lawyers admin UI populated with a realistic
 * example while real research is still in progress — it must never be
 * switched to "Published", since it is not a real firm.
 */
const DEMO_FIRM = {
  name: 'Example Research Profile (Sample — Do Not Publish)',
  slug: 'example-research-profile-sample',
  overviewParagraphs: [
    'This is a sample firm research profile, seeded only to demonstrate the Firms admin UI and the public firm-profile page template. It does not describe a real organisation and must never be set to "Published".',
  ],
  coreCapabilities: ['Sample capability one', 'Sample capability two'],
  representativeExperience: [{ description: 'Sample representative matter entry.', year: 2026 }],
}

const DEMO_LAWYER = {
  name: 'Jordan Example (Sample — Do Not Publish)',
  slug: 'jordan-example-sample',
  title: 'Partner (sample entry)',
  biographyParagraphs: [
    'This is a sample lawyer profile linked to the sample firm, seeded only to demonstrate the Lawyers admin UI. It does not describe a real person.',
  ],
}

async function seed() {
  // Dynamic import, not a static one — payload.config.ts reads
  // process.env at import time, and static imports are hoisted above
  // loadEnv() in ESM regardless of source order. This import must happen
  // here, after loadEnv() has actually run.
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Legal Pages…')
  for (const page of LEGAL_PAGES) {
    const existing = await payload.find({
      collection: 'legal-pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })

    const data = {
      title: page.title,
      slug: page.slug as any,
      reviewStatus: 'draft_placeholder' as const,
      body: paragraphsToLexical(page.paragraphs),
    }

    if (existing.docs[0]) {
      await payload.update({ collection: 'legal-pages', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'legal-pages', data })
    }
  }

  payload.logger.info('Persisting default global content (Site Settings, Home, About, Research, Pilot 2026)…')
  // Reading each global with no changes causes Payload to persist its
  // schema-level defaultValues as a real document, so they appear populated
  // (not blank) the first time an editor opens them in /admin.
  const globalSlugs = [
    'site-settings',
    'home-content',
    'about-content',
    'research-content',
    'pilot-2026-content',
  ] as const

  for (const slug of globalSlugs) {
    const current = await payload.findGlobal({ slug })
    await payload.updateGlobal({ slug, data: current as any })
  }

  // Attach the first admin user as author, if one exists, so seeded
  // Intelligence items don't sit with an empty author field.
  const firstUser = await payload.find({ collection: 'users', limit: 1 })
  const authorId = firstUser.docs[0]?.id

  payload.logger.info('Seeding Intelligence…')
  for (const item of SAMPLE_INTELLIGENCE) {
    const existing = await payload.find({
      collection: 'intelligence',
      where: { slug: { equals: item.slug } },
      limit: 1,
    })

    const data = {
      title: item.title,
      slug: item.slug,
      category: item.category as any,
      summary: item.summary,
      content: paragraphsToLexical(item.paragraphs),
      publishedAt: new Date().toISOString(),
      isSubscriberOnly: item.isSubscriberOnly ?? false,
      ...(authorId ? { author: authorId } : {}),
    }

    if (existing.docs[0]) {
      await payload.update({ collection: 'intelligence', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'intelligence', data })
    }
  }

  payload.logger.info('Seeding Events…')
  for (const event of SAMPLE_EVENTS) {
    const existing = await payload.find({
      collection: 'events',
      where: { slug: { equals: event.slug } },
      limit: 1,
    })

    const data = {
      title: event.title,
      slug: event.slug,
      eventDate: event.eventDate,
      venue: event.venue,
      description: paragraphsToLexical(event.paragraphs),
      speakers: event.speakers,
    }

    if (existing.docs[0]) {
      await payload.update({ collection: 'events', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'events', data })
    }
  }

  payload.logger.info('Seeding hidden demo Firm + Lawyer (Pilot 2026 status — not publicly visible)…')
  const existingFirm = await payload.find({
    collection: 'firms',
    where: { slug: { equals: DEMO_FIRM.slug } },
    limit: 1,
  })

  const firmData = {
    name: DEMO_FIRM.name,
    slug: DEMO_FIRM.slug,
    overview: paragraphsToLexical(DEMO_FIRM.overviewParagraphs),
    coreCapabilities: DEMO_FIRM.coreCapabilities.map((capability) => ({ capability })),
    representativeExperience: DEMO_FIRM.representativeExperience,
    researchStatus: 'pilot_2026' as const,
  }

  const firmDoc = existingFirm.docs[0]
    ? await payload.update({ collection: 'firms', id: existingFirm.docs[0].id, data: firmData })
    : await payload.create({ collection: 'firms', data: firmData })

  const existingLawyer = await payload.find({
    collection: 'lawyers',
    where: { slug: { equals: DEMO_LAWYER.slug } },
    limit: 1,
  })

  const lawyerData = {
    name: DEMO_LAWYER.name,
    slug: DEMO_LAWYER.slug,
    title: DEMO_LAWYER.title,
    biography: paragraphsToLexical(DEMO_LAWYER.biographyParagraphs),
    firm: firmDoc.id,
  }

  if (existingLawyer.docs[0]) {
    await payload.update({ collection: 'lawyers', id: existingLawyer.docs[0].id, data: lawyerData })
  } else {
    await payload.create({ collection: 'lawyers', data: lawyerData })
  }

  payload.logger.info(
    'Seed complete. Legal pages are marked "Draft placeholder" — review before launch. The demo firm/lawyer are hidden from the public site (Pilot 2026 status) — do not switch to Published.',
  )
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
