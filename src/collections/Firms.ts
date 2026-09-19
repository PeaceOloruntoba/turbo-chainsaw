import type { CollectionConfig } from "payload";
import { safeRevalidatePath } from "../utilities/revalidate";
import { isAdmin, isContentTeam, gatedByDocumentLevel } from "../access";

/**
 * Individual firm pages are independent research profiles — not paid
 * advertising or "enhanced profiles". There is deliberately no field here
 * for sponsorship tier, featured placement, or paid ranking: firms cannot
 * buy prominence within this collection (see brief §9, §Independence).
 */
export const Firms: CollectionConfig = {
  slug: "firms",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "researchStatus", "updatedAt"],
    group: "Research",
    description:
      'Independent firm research profiles. Firms & Lawyers is public-facing as a "Research in progress" notice until entries here are published.',
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        safeRevalidatePath("/firms");
        if (doc?.slug) safeRevalidatePath(`/firms/${doc.slug}`);
        return doc;
      },
    ],
    afterDelete: [
      ({ doc }) => {
        safeRevalidatePath("/firms");
        if (doc?.slug) safeRevalidatePath(`/firms/${doc.slug}`);
        return doc;
      },
    ],
  },
  access: {
    read: ({ req: { user } }) => {
      if (isContentTeam(user)) return true;
      // Public visitors and members only ever see published research.
      return { researchStatus: { equals: "published" } };
    },
    create: ({ req: { user } }) => isContentTeam(user),
    update: ({ req: { user } }) => isContentTeam(user),
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description: 'URL-friendly identifier, e.g. "example-llp".',
      },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Firm logo, used only on the firm's own research profile.",
      },
    },
    {
      name: "overview",
      type: "richText",
      admin: {
        description:
          "Firm Overview — independent editorial summary of the firm.",
      },
    },
    {
      name: "coreCapabilities",
      type: "array",
      labels: { singular: "Capability", plural: "Core Capabilities" },
      fields: [{ name: "capability", type: "text", required: true }],
    },
    {
      name: "practiceAreas",
      type: "select",
      hasMany: true,
      options: [
        { label: "Banking & Finance", value: "Banking & Finance" },
        { label: "Capital Markets", value: "Capital Markets" },
        { label: "Corporate & M&A", value: "Corporate & M&A" },
        {
          label: "Private Equity & Venture Capital",
          value: "Private Equity & Venture Capital",
        },
        {
          label: "Energy & Natural Resources",
          value: "Energy & Natural Resources",
        },
        { label: "Power & Infrastructure", value: "Power & Infrastructure" },
        {
          label: "Projects & Project Finance",
          value: "Projects & Project Finance",
        },
        {
          label: "Technology, Media & Telecommunications",
          value: "Technology, Media & Telecommunications",
        },
        { label: "Competition & Antitrust", value: "Competition & Antitrust" },
        { label: "Tax", value: "Tax" },
        { label: "Employment", value: "Employment" },
        { label: "Intellectual Property", value: "Intellectual Property" },
        { label: "Real Estate", value: "Real Estate" },
        {
          label: "Dispute Resolution & Arbitration",
          value: "Dispute Resolution & Arbitration",
        },
        { label: "Regulatory & Compliance", value: "Regulatory & Compliance" },
      ],
      admin: {
        description:
          "Only show categories Nigeria Lex is actively researching (brief §8).",
      },
    },
    {
      name: "representativeExperience",
      type: "array",
      access: { read: gatedByDocumentLevel },
      labels: { singular: "Matter", plural: "Representative Experience" },
      fields: [
        { name: "description", type: "textarea", required: true },
        { name: "year", type: "number" },
      ],
    },
    {
      name: "sectorStrengths",
      type: "array",
      fields: [{ name: "sector", type: "text", required: true }],
    },
    {
      name: "crossBorderExperience",
      type: "richText",
      access: { read: gatedByDocumentLevel },
    },
    {
      name: "nigeriaLexAnalysis",
      type: "richText",
      access: { read: gatedByDocumentLevel },
      admin: {
        description:
          "Editorial analysis — Nigeria Lex's independent assessment of the firm.",
      },
    },
    {
      name: "accessLevel",
      label: "Access level",
      type: "select",
      defaultValue: "public",
      options: [
        { label: "Public", value: "public" },
        { label: "Registered users", value: "registered" },
        { label: "Subscribers / institutional users", value: "subscriber" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Who may see the detailed sections of this record. Name and basic details stay public. Only takes effect for non-public levels once the member portal is switched on.",
      },
    },
    {
      name: "researchStatus",
      type: "select",
      required: true,
      defaultValue: "pilot_2026",
      options: [
        { label: "Pilot 2026 (in progress)", value: "pilot_2026" },
        { label: "Published", value: "published" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
