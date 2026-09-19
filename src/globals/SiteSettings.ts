import type { GlobalConfig } from "payload";
import { safeRevalidatePath } from "../utilities/revalidate";
import { adminOnlyField, isContentTeam } from "../access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: {
    group: "Site Configuration",
    description: "Logo, name, and correspondence details used across the site.",
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        // Logo, site name, footer, and contact details all render via the
        // shared Header/Footer, so every page under the site layout needs
        // to be revalidated, not just one route.
        safeRevalidatePath("/", "layout");
        return doc;
      },
    ],
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => isContentTeam(user),
  },
  fields: [
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Header logo. Falls back to the approved Nigeria Lex mark already in the codebase (public/logo-mark.png, paired with a text wordmark) until you upload a full lockup image here — e.g. a higher-resolution or alternate version.",
      },
    },
    {
      name: "favicon",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Browser favicon. Falls back to src/app/icon.png (the Nigeria Lex mark) until you upload an image here, which then takes over site-wide.",
      },
    },
    {
      name: "siteName",
      type: "text",
      required: true,
      defaultValue: "Nigeria Lex",
    },
    {
      name: "strapline",
      type: "text",
      required: true,
      defaultValue:
        "Independent research. Market intelligence. Informed choice.",
    },
    {
      name: "independenceStatement",
      type: "textarea",
      required: true,
      defaultValue:
        "Law firms and practitioners do not pay to be considered, included or recognised by Nigeria Lex. Sponsorship, advertising, subscriptions and other commercial relationships are kept separate from the research and editorial process and do not determine research outcomes.",
      admin: {
        description:
          "Shown on the Homepage and Research page independence banner.",
      },
    },
    {
      name: "footerCopyright",
      type: "text",
      required: true,
      defaultValue:
        "© {year} Kaye & Crowther Limited. All rights reserved. Nigeria Lex™ is a trade mark of Kaye & Crowther Limited.",
      admin: {
        description:
          "Use {year} as a placeholder — it is replaced with the current year automatically.",
      },
    },
    {
      name: "correspondence",
      type: "group",
      fields: [
        {
          name: "lagos",
          type: "textarea",
          defaultValue: "Nigeria Lex correspondence address to be confirmed.",
        },
        {
          name: "london",
          type: "textarea",
          defaultValue: "International presence — address to be confirmed.",
        },
      ],
    },
    {
      name: "memberPortal",
      label: "Member portal (login area)",
      type: "group",
      access: { update: adminOnlyField },
      admin: {
        description:
          "Controls the public sign-in area for registered users and subscribers. Everything stays OFF until you switch it on. Only Super Administrators can change these.",
      },
      fields: [
        {
          name: "enabled",
          label: "Enable member portal",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Shows a 'Sign in' link in the site header and turns on the /account pages for existing members.",
          },
        },
        {
          name: "registrationOpen",
          label: "Allow new registrations",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Lets visitors create their own (free, registered-level) account. Leave off to keep accounts invitation / administrator-created only.",
          },
        },
      ],
    },
    {
      name: "departmentalEmails",
      type: "array",
      labels: { singular: "Department", plural: "Departmental Emails" },
      defaultValue: [
        { label: "Research", email: "research@nigerialex.com" },
        { label: "Editorial", email: "editorial@nigerialex.com" },
        {
          label: "Partnerships & Institutional Enquiries",
          email: "partnerships@nigerialex.com",
        },
        { label: "Events", email: "events@nigerialex.com" },
        { label: "General", email: "info@nigerialex.com" },
      ],
      fields: [
        { name: "label", type: "text", required: true },
        { name: "email", type: "email", required: true },
      ],
    },
  ],
};
