import type { CollectionConfig } from "payload";
import crypto from "crypto";
import { sendStaffAlert, sendSubscriberConfirmationEmail } from "../lib/email";

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * Public subscription capture (Nigeria Lex Briefing). This collection is
 * intentionally NOT an auth collection — subscribers do not log in. Writes
 * happen only through the public /subscribe form via a scoped `create`
 * access rule; reading the list is staff-only.
 */
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  admin: {
    useAsTitle: "email",
    defaultColumns: [
      "email",
      "organisation",
      "country",
      "consented",
      "createdAt",
    ],
    group: "Audience",
    description:
      "Nigeria Lex Briefing subscribers, captured via the public Subscribe form.",
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // public submissions from the Subscribe page
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  hooks: {
    beforeChange: [
      ({ operation, data }) => {
        // Generate the self-service unsubscribe token once, on create.
        if (operation === "create" && !data.unsubscribeToken) {
          data.unsubscribeToken = crypto.randomBytes(24).toString("hex");
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== "create") return doc;

        const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${doc.unsubscribeToken}`;

        // Best-effort — a failed email must never block the subscription
        // from being saved, so errors are swallowed (sendEmail already logs
        // internally on failure).
        await Promise.allSettled([
          sendSubscriberConfirmationEmail({
            email: doc.email,
            firstName: doc.firstName,
            unsubscribeUrl,
          }),
          sendStaffAlert(
            "New Nigeria Lex subscriber",
            [
              `${doc.firstName || ""} ${doc.surname || ""}`.trim(),
              doc.organisation
                ? `Organisation: ${doc.organisation}`
                : undefined,
              doc.jobTitle ? `Job title: ${doc.jobTitle}` : undefined,
              `Email: ${doc.email}`,
              doc.country ? `Country: ${doc.country}` : undefined,
              doc.areasOfInterest?.length
                ? `Areas of interest: ${doc.areasOfInterest.join(", ")}`
                : undefined,
            ].filter(Boolean) as string[],
          ),
        ]);

        return doc;
      },
    ],
  },
  fields: [
    { name: "firstName", type: "text", required: true },
    { name: "surname", type: "text", required: true },
    { name: "organisation", type: "text" },
    { name: "jobTitle", type: "text" },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
    },
    { name: "country", type: "text" },
    {
      name: "areasOfInterest",
      type: "select",
      hasMany: true,
      options: [
        "Legal Market Research",
        "Firms & Lawyers",
        "Market Intelligence",
        "Reports & Briefings",
        "Pilot 2026",
        "Events",
      ],
    },
    {
      name: "consented",
      type: "checkbox",
      required: true,
      defaultValue: false,
      admin: {
        description:
          "Confirms the subscriber opted in to receive Nigeria Lex communications.",
      },
    },
    {
      name: "unsubscribed",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "unsubscribeToken",
      type: "text",
      unique: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Auto-generated. Powers the self-service /unsubscribe link sent in the confirmation email.",
      },
    },
  ],
};
