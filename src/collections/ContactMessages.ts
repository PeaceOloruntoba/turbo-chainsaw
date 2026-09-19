import type { CollectionConfig } from "payload";
import { isAdmin, isContentTeam } from "../access";
import { sendContactConfirmationEmail, sendStaffAlert } from "../lib/email";

/**
 * Stored submissions from the Contact page form. The Contact page also
 * keeps its existing mailto: department links alongside this form — this
 * collection only covers messages sent through the on-page form itself.
 */
export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "department", "status", "createdAt"],
    group: "Audience",
    description: "Messages submitted through the Contact page form.",
  },
  access: {
    read: ({ req: { user } }) => isContentTeam(user),
    create: () => true, // public submissions from the Contact page
    update: ({ req: { user } }) => isContentTeam(user),
    delete: ({ req: { user } }) => isAdmin(user),
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Public visitors cannot pre-set the triage status.
        if (operation === "create" && !isContentTeam(req.user)) data.status = "received";
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== "create") return doc;

        await Promise.allSettled([
          sendContactConfirmationEmail({ email: doc.email, name: doc.name }),
          sendStaffAlert(
            "New Nigeria Lex contact message",
            [
              `Name: ${doc.name}`,
              `Email: ${doc.email}`,
              doc.organisation
                ? `Organisation: ${doc.organisation}`
                : undefined,
              doc.department ? `Department: ${doc.department}` : undefined,
              `Message: ${doc.message}`,
            ].filter(Boolean) as string[],
          ),
        ]);

        return doc;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "organisation", type: "text" },
    {
      name: "department",
      type: "select",
      options: [
        { label: "Research", value: "research" },
        { label: "Editorial", value: "editorial" },
        {
          label: "Partnerships & Institutional Enquiries",
          value: "partnerships",
        },
        { label: "Events", value: "events" },
        { label: "General", value: "general" },
      ],
      admin: {
        description:
          "Optional — mirrors the departments listed on the Contact page.",
      },
    },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "received",
      options: [
        { label: "Received", value: "received" },
        { label: "Actioned", value: "actioned" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
