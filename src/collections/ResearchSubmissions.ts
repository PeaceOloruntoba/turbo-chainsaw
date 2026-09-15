import type { CollectionConfig } from "payload";
import {
  sendResearchSubmissionConfirmationEmail,
  sendStaffAlert,
} from "../lib/email";

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  law_firm: "Law firm — participate in research",
  corporate_counsel: "Corporate / General Counsel — contribute market feedback",
  investor: "Investor / Financial Institution — contribute market insight",
  professional_adviser: "Professional Adviser — contribute market insight",
  other_institutional: "Other Institutional Participant",
  general: "General Research Enquiry",
  institutional: "Institutional user — Contribute (legacy)",
};

/**
 * Secure electronic submission channel for law firms (Research §Participate,
 * Pilot 2026 §"Law Firms – Participate") and institutional users
 * (Pilot 2026 §"Institutional Users – Contribute"). Submissions are never
 * publicly readable — only Nigeria Lex staff can view them, matching the
 * "secure electronic submission" requirement in the brief.
 */
export const ResearchSubmissions: CollectionConfig = {
  slug: "research-submissions",
  admin: {
    useAsTitle: "organisationName",
    defaultColumns: [
      "organisationName",
      "submissionType",
      "status",
      "createdAt",
    ],
    group: "Audience",
    description: "Secure research participation and contribution submissions.",
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // public submissions from Research / Pilot 2026 forms
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== "create") return doc;

        await Promise.allSettled([
          sendResearchSubmissionConfirmationEmail({
            email: doc.contactEmail,
            contactName: doc.contactName,
          }),
          sendStaffAlert(
            "New Nigeria Lex research submission",
            [
              SUBMISSION_TYPE_LABELS[doc.submissionType] || doc.submissionType,
              `Organisation: ${doc.organisationName}`,
              `Contact: ${doc.contactName} <${doc.contactEmail}>`,
              doc.contactPhone ? `Phone: ${doc.contactPhone}` : undefined,
              doc.role ? `Role: ${doc.role}` : undefined,
              doc.practiceAreasOrSector
                ? `Practice area / sector: ${doc.practiceAreasOrSector}`
                : undefined,
              doc.message ? `Message: ${doc.message}` : undefined,
            ].filter(Boolean) as string[],
          ),
        ]);

        return doc;
      },
    ],
  },
  fields: [
    {
      name: "submissionType",
      type: "select",
      required: true,
      options: [
        { label: "Law firm — participate in research", value: "law_firm" },
        {
          label: "Corporate / General Counsel — contribute market feedback",
          value: "corporate_counsel",
        },
        {
          label: "Investor / Financial Institution — contribute market insight",
          value: "investor",
        },
        {
          label: "Professional Adviser — contribute market insight",
          value: "professional_adviser",
        },
        {
          label: "Other Institutional Participant",
          value: "other_institutional",
        },
        { label: "General Research Enquiry", value: "general" },
        // Retained for backwards compatibility with submissions collected before
        // the submission-type routes above were introduced.
        {
          label: "Institutional user — Contribute (legacy)",
          value: "institutional",
        },
      ],
    },
    { name: "organisationName", type: "text", required: true },
    { name: "contactName", type: "text", required: true },
    { name: "contactEmail", type: "email", required: true },
    { name: "contactPhone", type: "text" },
    {
      name: "role",
      type: "text",
      admin: {
        description:
          "Institutional participants: the contact\u2019s role/title within their organisation.",
      },
    },
    {
      name: "practiceAreasOrSector",
      type: "text",
      admin: {
        description:
          "Law firms: relevant practice area(s). Institutional participants: sector.",
      },
    },
    {
      name: "message",
      type: "textarea",
      admin: {
        description:
          "Law firms: submission information. Institutional participants: nature of contribution. General enquiries: message.",
      },
    },
    {
      name: "mayContactConfidentially",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Institutional participants only: whether Nigeria Lex may contact them confidentially for research purposes.",
      },
    },
    {
      name: "attachment",
      type: "upload",
      relationTo: "media",
      admin: { description: "Supporting document, e.g. firm submission form." },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "received",
      options: [
        { label: "Received", value: "received" },
        { label: "Under review", value: "under_review" },
        { label: "Actioned", value: "actioned" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
