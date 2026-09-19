import type { CollectionConfig } from "payload";
import { safeRevalidatePath } from "../utilities/revalidate";
import { isAdmin, isContentTeam, gatedByDocumentLevel } from "../access";

async function revalidateRelatedFirm({ doc, req }: { doc: any; req: any }) {
  const firmRef = doc?.firm;
  if (!firmRef) return doc;
  try {
    const firmId = typeof firmRef === "object" ? firmRef.id : firmRef;
    const firm = await req.payload.findByID({
      collection: "firms",
      id: firmId,
    });
    if (firm?.slug) safeRevalidatePath(`/firms/${firm.slug}`);
  } catch {
    // Firm may have been deleted, or this is running outside a request
    // context (e.g. the seed script) — nothing to revalidate either way.
  }
  return doc;
}

export const Lawyers: CollectionConfig = {
  slug: "lawyers",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "firm", "title", "updatedAt"],
    group: "Research",
  },
  hooks: {
    afterChange: [revalidateRelatedFirm],
    afterDelete: [revalidateRelatedFirm],
  },
  access: {
    // A practitioner is only public once their firm's research is published
    // (previously every lawyer record was readable via /api/lawyers, including
    // those attached to unpublished Pilot 2026 firms).
    read: ({ req: { user } }) => {
      if (isContentTeam(user)) return true;
      return { "firm.researchStatus": { equals: "published" } };
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
      admin: { position: "sidebar" },
    },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      name: "title",
      type: "text",
      admin: { description: "e.g. Partner, Senior Associate." },
    },
    { name: "biography", type: "richText", access: { read: gatedByDocumentLevel } },
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
      name: "firm",
      type: "relationship",
      relationTo: "firms",
      admin: { position: "sidebar" },
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
    },
    {
      name: "sectorKnowledge",
      type: "array",
      fields: [{ name: "sector", type: "text", required: true }],
    },
    {
      name: "experienceYears",
      type: "number",
      admin: { description: "Years of active practice." },
    },
  ],
};
