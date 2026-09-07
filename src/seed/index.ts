import { config as loadEnv } from 'dotenv'
loadEnv()

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

  payload.logger.info('Seed complete. Legal pages are marked "Draft placeholder" — review before launch.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
