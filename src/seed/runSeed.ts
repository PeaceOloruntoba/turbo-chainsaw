import type { Payload } from 'payload'
import { paragraphsToLexical } from './lexical'

/**
 * Populates the CMS with real, client-approved starting content (from the
 * Nigeria Lex web content brief) so every page is fully wired from day
 * one. Globals are always overwritten with the content below — this is
 * the authoritative source, not just a fallback for empty fields — so
 * re-running this script after content changes here will push those
 * changes to the database. Legal Pages remain an explicit, clearly-marked
 * draft pending legal review; nothing here should be treated as reviewed
 * legal advice.
 *
 * Usage:  npm run seed
 * Safe to re-run: it updates existing documents by slug rather than
 * duplicating them. Requires DATABASE_URI and PAYLOAD_SECRET in .env —
 * the "seed" npm script wraps this with dotenv-cli so those are loaded
 * before this file (or any Payload code) runs.
 */

// ---------------------------------------------------------------------------
// Globals — authoritative content, always overwritten on seed
// ---------------------------------------------------------------------------

const SITE_SETTINGS_DATA = {
  siteName: 'Nigeria Lex',
  strapline: 'Legal Market Intelligence for Informed Decisions',
  independenceStatement:
    'Law firms and practitioners do not pay to be considered, included or recognised by Nigeria Lex. Sponsorship, advertising, subscriptions and other commercial relationships are kept separate from the research and editorial process and do not determine research outcomes.',
  footerCopyright:
    '© {year} Kaye & Crowther Limited. All rights reserved. Nigeria Lex™ is a trade mark of Kaye & Crowther Limited.',
  correspondence: {
    lagos: '8A Lati Lawal Close\nLekki Phase 1\nLagos, Nigeria\nTel: +234 90 5480 3937',
    london: 'International presence — address to be confirmed.',
  },
  departmentalEmails: [
    { label: 'Research', email: 'research@nigerialex.com' },
    { label: 'Editorial', email: 'editorial@nigerialex.com' },
    { label: 'Partnerships & Institutional Enquiries', email: 'partnerships@nigerialex.com' },
    { label: 'Events', email: 'events@nigerialex.com' },
    { label: 'General', email: 'info@nigerialex.com' },
  ],
}

const HOME_CONTENT_DATA = {
  heroHeadline: 'Independent research. Market intelligence. Informed choice.',
  heroBody:
    "Nigeria Lex is an independent, research-led legal market intelligence platform providing credible insight into the capabilities, experience and expertise of Nigeria's corporate law firms and practitioners. We combine legal-market knowledge, evidence-led research and market intelligence to help businesses, investors, financial institutions and professional advisers make better-informed decisions about Nigeria's legal market.",
  ctaPrimaryLabel: 'Explore Our Research',
  ctaPrimaryHref: '/research',
  ctaSecondaryLabel: 'About Nigeria Lex',
  ctaSecondaryHref: '/about',
  pillars: [
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
      description:
        'Evidence-led profiles and recognition of firms and practitioners demonstrating significant capability.',
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
  pilotTeaserLabel: 'Nigeria Lex Pilot Study 2026',
  pilotTeaserHeadline: 'Our inaugural pilot study is testing and refining the Nigeria Lex methodology.',
}

const ABOUT_CONTENT_DATA = {
  tagline: "Better information about Nigeria's legal market",
  whoWeAre:
    "Nigeria has one of Africa's largest and most sophisticated legal markets. Yet reliable, independently researched information about the capabilities and experience of its corporate law firms and practitioners can be difficult to obtain, particularly for organisations entering the market or instructing Nigerian counsel for the first time.\n\nNigeria Lex was established to address that information gap.\n\nWe research and analyse the Nigerian corporate legal market to provide independent insight into firms, practitioners, transactions, sectors and emerging areas of legal expertise.",
  purpose:
    'Our purpose is not simply to identify prominent names. We seek to understand where demonstrable capability exists, how that capability has been developed, and where particular expertise may be found.',
  leadership: {
    name: 'Paul Onifade',
    title: 'Founder & Editor-in-Chief',
    biography:
      'Nigeria Lex was conceived by Paul Onifade, Solicitor Advocate of the Senior Courts of England and Wales, who serves as its Founder and Editor-in-Chief.',
  },
  ownershipText: 'Nigeria Lex is promoted and published by Kaye & Crowther Limited.',
  researchPartnerText:
    'Strategic Research & Intelligence Partner: SBM Intelligence — an Africa-focused market intelligence, security intelligence, and strategic consulting firm. It is a leading provider of strategic research and analysis, delivering actionable insights into the socio-political, economic, security, and business environments across West Africa through evidence-based research, data analytics, and practical policy recommendations.',
}

const RESEARCH_CONTENT_DATA = {
  tagline: 'Evidence before reputation',
  methodologyText:
    "Nigeria Lex seeks to provide an independent assessment of Nigeria's corporate legal market based upon research rather than reputation alone. Our research considers evidence of demonstrated capability, significant work, practitioner expertise, market experience and other relevant indicators.",
  howWeResearch: [
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
  noSingleFactorText: 'No single factor determines a Nigeria Lex assessment.',
  criteria: [
    { label: 'Experience', detail: 'The nature, complexity and significance of work undertaken.' },
    { label: 'Expertise', detail: 'Demonstrated specialist capability within a practice area or sector.' },
    { label: 'Practitioners', detail: 'Depth and quality of relevant practitioner experience.' },
    { label: 'Clients and Markets', detail: 'Experience advising sophisticated domestic and international clients.' },
    { label: 'Transactions', detail: 'Participation in significant or representative transactions and mandates.' },
    { label: 'Sector Knowledge', detail: 'Evidence of sustained expertise within relevant industries.' },
    {
      label: 'Cross-Border Capability',
      detail: 'Experience involving international clients, counterparties, advisers and transactions.',
    },
    { label: 'Market Evidence', detail: 'Information obtained through independent consultation and research.' },
  ],
  process: [
    { step: 'Research', detail: 'Gathering evidence on firms, practitioners, transactions and sector activity.' },
    { step: 'Verification', detail: 'Checking findings against independent sources and market evidence.' },
    { step: 'Analysis', detail: 'Assessing capability, experience and market standing against our criteria.' },
    { step: 'Editorial Review', detail: 'Independent editorial scrutiny before any material is published.' },
    {
      step: 'Publication',
      detail: 'Findings are published on Nigeria Lex, subject to ongoing correction and review.',
    },
  ],
  researchIndependenceText:
    "Participation in Nigeria Lex research is free. A firm's decision whether to advertise, sponsor an event, subscribe to Nigeria Lex Intelligence or enter into another commercial relationship with Nigeria Lex has no bearing upon its assessment, inclusion or recognition.",
  correctionsText:
    'Nigeria Lex seeks accuracy and fairness. Firms and practitioners may bring factual inaccuracies to our attention. Requests for correction will be considered where supported by appropriate evidence. A request for review does not guarantee alteration of an editorial assessment.',
  participateIntro:
    'Law firms and institutional users can submit information for consideration as part of Nigeria Lex research using the secure form below. Research deadlines and downloadable submission forms will be published here ahead of each research cycle.',
}

const PILOT_2026_CONTENT_DATA = {
  intro:
    "Nigeria Lex is undertaking an inaugural pilot study examining selected areas of Nigeria's corporate legal market. The pilot will test and refine the Nigeria Lex research methodology through engagement with law firms, practitioners, investors and institutional users.",
  objectives:
    "To test and refine Nigeria Lex's research methodology ahead of full-scale research, and to establish the platform's initial evidence base.",
  researchScope:
    "A selected range of practice areas within Nigeria's corporate legal market, chosen for their significance to institutional users of legal services.",
  methodologyNote:
    'The pilot follows the Nigeria Lex research process: research, verification, analysis, editorial review and publication.',
  practiceAreasNote:
    'To be confirmed as pilot research progresses and will be published on the Firms & Lawyers section as it becomes available.',
  timeline: [
    {
      label: 'Research and consultation',
      detail: 'September–November 2026.',
    },
    {
      label: 'Nigeria market engagement',
      detail: '19 October–19 November 2026.',
    },
    {
      label: 'Proposed pilot presentation / launch',
      detail: 'Week commencing 16 November 2026, in Lagos, subject to research progress.',
    },
  ],
}

// ---------------------------------------------------------------------------
// Legal Pages — draft placeholder, pending legal counsel review
// ---------------------------------------------------------------------------

const LEGAL_PAGES: Array<{ slug: string; title: string; paragraphs: string[] }> = [
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
      'Law firms and practitioners do not pay to be considered, included or recognised by Nigeria Lex. Sponsorship, advertising, subscriptions and other commercial relationships are kept separate from the research and editorial process and do not determine research outcomes.',
      'Research findings are subject to Nigeria Lex\u2019s methodology, including verification against independent sources and editorial review, before publication. Editorial decisions rest with Nigeria Lex\u2019s Editor-in-Chief and research team.',
      'This is placeholder text pending review by Nigeria Lex\u2019s legal counsel. It should not be relied upon as final.',
    ],
  },
  {
    slug: 'corrections-policy',
    title: 'Corrections Policy',
    paragraphs: [
      'Nigeria Lex seeks accuracy and fairness. Firms and practitioners may bring factual inaccuracies to our attention. Requests for correction will be considered where supported by appropriate evidence.',
      'A request for review does not guarantee alteration of an editorial assessment.',
      'If you believe published content contains a factual error, please contact editorial@nigerialex.com with details of the item and the correction requested.',
      'This is placeholder text pending review by Nigeria Lex\u2019s legal counsel and formal adoption of internal correction procedures. It should not be relied upon as final.',
    ],
  },
]

// ---------------------------------------------------------------------------
// Sample Intelligence, Events, and a hidden demo Firm/Lawyer
// ---------------------------------------------------------------------------

const SAMPLE_INTELLIGENCE: Array<{
  title: string
  slug: string
  category: string
  summary: string
  paragraphs: string[]
}> = [
  {
    title: 'Welcome to Nigeria Lex',
    slug: 'welcome-to-nigeria-lex',
    category: 'Briefing',
    summary:
      "Nigeria Lex launches as an independent, research-led platform for Nigeria's corporate legal market.",
    paragraphs: [
      "Nigeria Lex has launched as an independent, research-led legal market intelligence platform focused on Nigeria's corporate legal market. Our purpose is to provide credible, evidence-led information concerning Nigerian corporate law firms, practitioners, transactions, sectors and market developments to investors, financial institutions, multinational corporations and other institutional users of Nigerian legal services.",
      'Law firms and practitioners do not pay to be considered, included or recognised by Nigeria Lex — see our Editorial Independence policy for more detail.',
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
      'Research and consultation runs September–November 2026, with Nigeria market engagement from 19 October to 19 November 2026.',
      'Nigeria Lex proposes to present initial pilot findings in Lagos, in the week commencing 16 November 2026, subject to research progress.',
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
      'A presentation of initial findings from the Nigeria Lex Pilot Study 2026, proposed for the week commencing 16 November 2026 in Lagos, subject to research progress.',
    ],
    speakers: [{ name: 'Paul Onifade', role: 'Founder & Editor-in-Chief', organisation: 'Nigeria Lex' }],
  },
]

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

export async function runSeed(payload: Payload) {
  payload.logger.info('Writing Site Settings, Home, About, Research and Pilot 2026 content…')
  await payload.updateGlobal({ slug: 'site-settings', data: SITE_SETTINGS_DATA as any })
  await payload.updateGlobal({ slug: 'home-content', data: HOME_CONTENT_DATA as any })
  await payload.updateGlobal({ slug: 'about-content', data: ABOUT_CONTENT_DATA as any })
  await payload.updateGlobal({ slug: 'research-content', data: RESEARCH_CONTENT_DATA as any })
  await payload.updateGlobal({ slug: 'pilot-2026-content', data: PILOT_2026_CONTENT_DATA as any })

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
      isSubscriberOnly: false,
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

  return {
    legalPages: LEGAL_PAGES.length,
    intelligence: SAMPLE_INTELLIGENCE.length,
    events: SAMPLE_EVENTS.length,
    demoFirm: DEMO_FIRM.slug,
  }
}
