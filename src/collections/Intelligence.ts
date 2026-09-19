import type { CollectionConfig } from "payload";
import { APIError } from "payload";
import { safeRevalidatePath } from "../utilities/revalidate";
import { isAdmin, isContentTeam, gatedByDocumentLevel } from "../access";

export const Intelligence: CollectionConfig = {
  slug: "intelligence",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "accessLevel"],
    group: "Content",
    description:
      "Nigeria Lex Intelligence — articles, reports, briefings and analysis.",
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // `accessLevel` is the source of truth. The legacy `isSubscriberOnly`
        // checkbox is kept in step so older code (seed script, sitemap) still works.
        const level = data.accessLevel ?? originalDoc?.accessLevel;
        if (level) data.isSubscriberOnly = level === "subscriber";

        // Files uploaded to the public Media library are directly downloadable
        // by URL, so they must never be attached to a members-only item.
        const attachedPublicPdf = "pdfAttachment" in data ? data.pdfAttachment : originalDoc?.pdfAttachment;
        if (level && level !== "public" && attachedPublicPdf) {
          throw new APIError(
            "Members-only items cannot use the public PDF field. Upload the file under Restricted documents and attach it in the 'Login-protected download' field instead.",
            400,
            undefined,
            true,
          );
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        safeRevalidatePath("/"); // homepage "Latest Intelligence" preview
        safeRevalidatePath("/intelligence");
        if (doc?.slug) safeRevalidatePath(`/intelligence/${doc.slug}`);

        // Keep the attached restricted file's access level in step with this item.
        const attachment = doc?.restrictedAttachment;
        const attachmentId = typeof attachment === "object" && attachment ? attachment.id : attachment;
        if (attachmentId) {
          try {
            await req.payload.update({
              collection: "restricted-documents",
              id: attachmentId,
              data: { accessLevel: doc.accessLevel ?? (doc.isSubscriberOnly ? "subscriber" : "public") },
              overrideAccess: true,
              depth: 0,
              req,
            });
          } catch (error) {
            req.payload.logger.error({ err: error, msg: "Could not sync restricted document access level" });
          }
        }
        return doc;
      },
    ],
    afterDelete: [
      ({ doc }) => {
        safeRevalidatePath("/");
        safeRevalidatePath("/intelligence");
        if (doc?.slug) safeRevalidatePath(`/intelligence/${doc.slug}`);
        return doc;
      },
    ],
  },
  access: {
    // Staff see everything (including drafts / future-dated items). Everyone
    // else, INCLUDING signed-in members, only sees published items. The
    // summary is always public; the full `content` is gated per item below.
    read: ({ req: { user } }) => {
      if (isContentTeam(user)) return true;
      return { publishedAt: { less_than_equal: new Date().toISOString() } };
    },
    create: ({ req: { user } }) => isContentTeam(user),
    update: ({ req: { user } }) => isContentTeam(user),
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Article", value: "Article" },
        { label: "Report", value: "Report" },
        { label: "Briefing", value: "Briefing" },
        { label: "Sector Briefing", value: "Sector Briefing" },
        {
          label: "Transaction Intelligence",
          value: "Transaction Intelligence",
        },
        { label: "Regulatory Intelligence", value: "Regulatory Intelligence" },
        { label: "Investor Briefing", value: "Investor Briefing" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: {
        description:
          "Shown on listing pages and as the article/report standfirst.",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      // Enforced in the API itself (REST/GraphQL/Local API with access on),
      // not just hidden in the page: the body is simply not returned to
      // viewers whose level is below this item's accessLevel.
      access: { read: gatedByDocumentLevel },
    },
    {
      name: "accessLevel",
      label: "Access level",
      type: "select",
      defaultValue: "public",
      index: true,
      options: [
        { label: "Public — anyone", value: "public" },
        { label: "Registered users — free account", value: "registered" },
        { label: "Subscribers / institutional users", value: "subscriber" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Who can read the full item. The title and summary always remain public. Non-public levels need the member portal switched on (Site Settings).",
      },
    },
    {
      // Legacy flag — kept only so older code paths keep working. Managed
      // automatically from `accessLevel`; do not edit.
      name: "isSubscriberOnly",
      type: "checkbox",
      defaultValue: false,
      admin: { hidden: true },
    },
    {
      name: "pdfAttachment",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "PUBLIC downloadable PDF — anyone with the link can download it. Use only for items with Public access.",
      },
    },
    {
      name: "restrictedAttachment",
      label: "Login-protected download",
      type: "upload",
      relationTo: "restricted-documents",
      access: { read: gatedByDocumentLevel },
      admin: {
        description:
          "Downloadable report that follows this item's access level. Upload it under Restricted documents first.",
      },
    },
  ],
};
