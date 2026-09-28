import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";
import { activityExportHandler } from "../lib/activityExport";

/**
 * SITE-WIDE ACTIVITY LOG — an append-only record of what happens on the site:
 * content and settings changes, user/member management, sign-ins and failed
 * sign-ins, form submissions, exports and maintenance tasks.
 *
 * Rows are written only by server-side hooks (see lib/activity.ts). Nobody —
 * including Super Administrators — can create, edit or delete rows through the
 * admin panel or the API. Only Super Administrators can read it.
 * (The Commercial Register keeps its own, more detailed Audit Trail that K&C
 * and SBM users can also see.)
 */
export const ActivityLog: CollectionConfig = {
  slug: "activity-log",
  labels: { singular: "Activity", plural: "Activity Log" },
  admin: {
    group: "Security & Audit",
    useAsTitle: "summary",
    defaultColumns: [
      "createdAt",
      "action",
      "resource",
      "resourceLabel",
      "actorName",
      "summary",
    ],
    listSearchableFields: [
      "summary",
      "actorName",
      "actorEmail",
      "resourceLabel",
      "ipAddress",
    ],
    description:
      "Everything that happens on the site: who did what, when, and from where. Read-only. Only Super Administrators can see this.",
    hidden: ({ user }) => !isAdmin(user),
    components: {
      beforeListTable: [
        "@/components/admin/ActivityLogExportLink#ActivityLogExportLink",
      ],
    },
  },
  defaultSort: "-createdAt",
  access: {
    read: ({ req: { user } }) => isAdmin(user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  endpoints: [
    { path: "/export", method: "get", handler: activityExportHandler },
  ],
  fields: [
    {
      name: "action",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Created", value: "create" },
        { label: "Updated", value: "update" },
        { label: "Deleted", value: "delete" },
        { label: "Signed in", value: "login" },
        { label: "Signed out", value: "logout" },
        { label: "Failed sign-in", value: "login_failed" },
        { label: "Account locked", value: "account_locked" },
        {
          label: "Password reset requested",
          value: "password_reset_requested",
        },
        { label: "Email verified", value: "email_verified" },
        { label: "Exported", value: "export" },
        { label: "System task", value: "system" },
      ],
      admin: { readOnly: true },
    },
    {
      name: "resourceType",
      type: "select",
      index: true,
      options: [
        { label: "Collection", value: "collection" },
        { label: "Page / settings", value: "global" },
        { label: "Account", value: "account" },
        { label: "System", value: "system" },
      ],
      admin: { readOnly: true },
    },
    {
      name: "resource",
      label: "Area",
      type: "text",
      index: true,
      admin: { readOnly: true },
    },
    {
      name: "resourceLabel",
      label: "Record",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "resourceId",
      type: "text",
      index: true,
      admin: { readOnly: true },
    },
    { name: "summary", type: "textarea", admin: { readOnly: true } },
    {
      name: "changes",
      type: "json",
      admin: {
        readOnly: true,
        description:
          "Field-by-field previous and new values where recording them is safe. Passwords, tokens and personal details are never copied here.",
      },
    },
    {
      name: "actorType",
      label: "Who (type)",
      type: "select",
      index: true,
      options: [
        { label: "Staff", value: "staff" },
        { label: "Member", value: "member" },
        { label: "Public visitor", value: "public" },
        { label: "System task", value: "system" },
      ],
      admin: { readOnly: true },
    },
    { name: "actorId", type: "text", index: true, admin: { readOnly: true } },
    {
      name: "actorName",
      label: "Who",
      type: "text",
      admin: { readOnly: true },
    },
    { name: "actorEmail", type: "text", admin: { readOnly: true } },
    { name: "actorRole", type: "text", admin: { readOnly: true } },
    {
      name: "actorOrganisation",
      type: "select",
      options: [
        { label: "K&C / Nigeria Lex", value: "kc" },
        { label: "SBM", value: "sbm" },
      ],
      admin: { readOnly: true },
    },
    {
      name: "ipAddress",
      label: "IP address",
      type: "text",
      index: true,
      admin: {
        readOnly: true,
        description: "As reported by the hosting provider’s proxy.",
      },
    },
    {
      name: "userAgent",
      label: "Browser",
      type: "text",
      admin: { readOnly: true },
    },
  ],
};
