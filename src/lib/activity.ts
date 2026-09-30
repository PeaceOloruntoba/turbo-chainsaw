import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterErrorHook,
  CollectionAfterForgotPasswordHook,
  CollectionAfterLoginHook,
  CollectionAfterLogoutHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
  Payload,
  PayloadRequest,
} from "payload";

/**
 * SITE-WIDE ACTIVITY LOG
 *
 * Records who did what, when and from where, across the whole system:
 *   • every create / update / delete on every collection and global
 *   • sign-ins, sign-outs, failed sign-ins, locked accounts, password-reset requests
 *   • member registration and email verification
 *   • CSV exports and deployment/maintenance tasks
 *
 * It is attached automatically to every collection and global (see
 * `withActivityLog` / `withActivityLogGlobal`, used in payload.config.ts), so
 * a collection added in future is covered without extra work.
 *
 * PRIVACY BY DESIGN — what is and is not written down:
 *   • Passwords, password hashes, tokens and sessions are NEVER recorded.
 *     A password change is logged as "password changed" with no value.
 *   • Personal data collections (members, subscribers, contact messages,
 *     research submissions) log which fields changed, and values only for a
 *     short allow-list of harmless status fields (e.g. access level, status).
 *   • The Commercial Register logs field NAMES only here; the values and
 *     previous values are in its own Audit Trail, which K&C and SBM users can see.
 *   • Rich text, files and long lists are logged as "changed", not copied.
 *   • Other content (firms, articles, events, settings …) records previous and
 *     new values for simple fields.
 *
 * The log is append-only: nobody can create, edit or delete rows through the
 * admin panel or API, and only Super Administrators can read it.
 */

export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "login_failed"
  | "account_locked"
  | "password_reset_requested"
  | "email_verified"
  | "export"
  | "system";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>;

export type Change = {
  field: string;
  from?: unknown;
  to?: unknown;
  changed?: true;
};

type Policy =
  | { mode: "values" }
  | { mode: "allowlist"; fields: string[] }
  | { mode: "names" };

/** Collections that must not log themselves (would loop / duplicate). */
const EXCLUDED = new Set(["activity-log", "commercial-audit-log", "research-access-tokens"]);

const POLICIES: Record<string, Policy> = {
  users: {
    mode: "allowlist",
    fields: ["name", "email", "role", "organisation", "active"],
  },
  members: {
    mode: "allowlist",
    fields: [
      "accessLevel",
      "status",
      "approvalStatus",
      "accountType",
      "subscription.plan",
      "subscription.state",
      "subscription.startedAt",
      "subscription.expiresAt",
      "subscription.provider",
    ],
  },
  subscribers: { mode: "allowlist", fields: ["unsubscribed"] },
  "contact-messages": { mode: "allowlist", fields: ["status"] },
  "research-submissions": { mode: "allowlist", fields: ["status"] },  "research-participants": { mode: "allowlist", fields: ["active", "invitationStatus"] },
  "research-portal-submissions": { mode: "allowlist", fields: ["status", "progress", "submittedAt"] },
  "research-documents": { mode: "names" },
  "research-portal-settings": { mode: "names" },
  "commercial-register": { mode: "names" },
};

/** Which field best identifies a record in the log (defaults to a sensible guess). */
const LABEL_FIELD: Record<string, string> = {
  users: "email",
  members: "email",
  subscribers: "email",
  "commercial-register": "reference",  "research-participants": "firmName",
  "research-portal-submissions": "reference",
  "research-documents": "title",
};

/** Bookkeeping / secret / noisy fields that are never diffed or stored. */
const SKIP_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "sessions",
  "loginAttempts",
  "lockUntil",
  "lastLoginAt",
  "_verified",
  "_verificationToken",
  "resetPasswordToken",
  "resetPasswordExpiration",
  "salt",
  "hash",
  "password",
  "unsubscribeToken",
  "sizes",
  "thumbnailURL",
  "url",
  "filesize",
  "width",
  "height",
  "focalX",
  "focalY",
]);

/* ── Diffing ───────────────────────────────────────────────────────── */

type Flat = Record<
  string,
  string | number | boolean | null | { opaque: string }
>;

const isPlainObject = (v: unknown): v is Doc =>
  Boolean(v) &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  !(v instanceof Date);

function flatten(
  doc: Doc | null | undefined,
  prefix = "",
  depth = 0,
  out: Flat = {},
): Flat {
  for (const [key, value] of Object.entries(doc ?? {})) {
    if (SKIP_FIELDS.has(key)) continue;
    const path = prefix ? `${prefix}.${key}` : key;

    if (value === undefined || value === null || value === "") {
      out[path] = null;
    } else if (value instanceof Date) {
      out[path] = value.toISOString();
    } else if (Array.isArray(value)) {
      out[path] = { opaque: JSON.stringify(value) };
    } else if (isPlainObject(value)) {
      if ("id" in value && !("root" in value)) {
        // A populated relationship: keep only its id.
        out[path] = String(value.id);
      } else if (depth < 1 && !("root" in value)) {
        flatten(value, path, depth + 1, out); // one level of group fields
      } else {
        out[path] = { opaque: JSON.stringify(value) }; // rich text / deep objects
      }
    } else {
      out[path] = value as string | number | boolean;
    }
  }
  return out;
}

// Primitives are compared as text so a relationship id (5) and the same id when
// populated ("5") are not reported as a change.
const norm = (v: Flat[string] | undefined) =>
  v === undefined || v === null
    ? null
    : typeof v === "object"
      ? JSON.stringify(v)
      : String(v);
const same = (a: Flat[string] | undefined, b: Flat[string] | undefined) =>
  norm(a) === norm(b);

function canShow(field: string, policy: Policy) {
  if (policy.mode === "values") return true;
  if (policy.mode === "allowlist") return policy.fields.includes(field);
  return false;
}

const shown = (value: Flat[string] | undefined): unknown => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string")
    return value.length > 200 ? `${value.slice(0, 199)}…` : value;
  return value as unknown;
};

export function diffDocs(
  before: Doc | null | undefined,
  after: Doc | null | undefined,
  policy: Policy,
): Change[] {
  const a = flatten(before);
  const b = flatten(after);
  const changes: Change[] = [];
  for (const field of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (same(a[field], b[field])) continue;
    const opaque =
      (typeof a[field] === "object" && a[field] !== null) ||
      (typeof b[field] === "object" && b[field] !== null);
    if (!opaque && canShow(field, policy))
      changes.push({ field, from: shown(a[field]), to: shown(b[field]) });
    else changes.push({ field, changed: true });
  }
  return changes.slice(0, 60);
}

/** Values (per policy) present on a record at creation / deletion. */
export function snapshotDoc(
  doc: Doc | null | undefined,
  policy: Policy,
): Change[] {
  const flat = flatten(doc);
  const out: Change[] = [];
  for (const [field, value] of Object.entries(flat)) {
    if (value === null || typeof value === "object") continue;
    if (canShow(field, policy)) out.push({ field, to: shown(value) });
  }
  return out.slice(0, 40);
}

/* ── Who / where ───────────────────────────────────────────────────── */

type Actor = {
  actorType: "staff" | "member" | "public" | "system";
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  actorOrganisation?: "kc" | "sbm";
};

function headerOf(
  req: PayloadRequest | undefined,
  name: string,
): string | undefined {
  try {
    return req?.headers?.get?.(name) ?? undefined;
  } catch {
    return undefined;
  }
}

export function requestInfo(req?: PayloadRequest) {
  // As reported by the hosting proxy (Vercel / Apache). Treat as indicative, not proof.
  const forwarded = headerOf(req, "x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headerOf(req, "x-real-ip");
  const userAgent = headerOf(req, "user-agent");
  return { ip: ip?.slice(0, 64), userAgent: userAgent?.slice(0, 250) };
}

export function actorFrom(
  req?: PayloadRequest,
  userOverride?: Doc | null,
): Actor {
  const user = (userOverride ?? req?.user) as Doc | null | undefined;
  if (user) {
    const staff = user.collection === "users";
    const name =
      (user.name as string) ||
      [user.firstName, user.surname].filter(Boolean).join(" ") ||
      (user.email as string);
    return {
      actorType: staff ? "staff" : "member",
      actorId: String(user.id),
      actorName: name,
      actorEmail: user.email,
      actorRole: staff ? user.role : "member",
      actorOrganisation: staff
        ? user.organisation === "sbm"
          ? "sbm"
          : "kc"
        : undefined,
    };
  }
  const { ip, userAgent } = requestInfo(req);
  return ip || userAgent
    ? { actorType: "public", actorName: "Public visitor" }
    : { actorType: "system", actorName: "System task" };
}

/* ── Writing entries ───────────────────────────────────────────────── */

export type ActivityEntry = {
  action: ActivityAction;
  resourceType: "collection" | "global" | "account" | "system";
  resource?: string;
  resourceId?: string;
  resourceLabel?: string;
  summary: string;
  changes?: Change[];
  req?: PayloadRequest;
  /** Explicit actor (e.g. the user who just signed in, before req.user is set). */
  user?: Doc | null;
  actor?: Partial<Actor>;
  ip?: string;
  userAgent?: string;
  /** Join the caller's database transaction so the change and its log row stand or fall together. */
  transactional?: boolean;
};

const STRICT = process.env.ACTIVITY_LOG_STRICT !== "false";

export async function logActivity(payload: Payload, entry: ActivityEntry) {
  const actor = { ...actorFrom(entry.req, entry.user), ...(entry.actor ?? {}) };
  const info = requestInfo(entry.req);

  const write = () =>
    payload.create({
      collection: "activity-log" as never,
      data: {
        action: entry.action,
        resourceType: entry.resourceType,
        resource: entry.resource,
        resourceId: entry.resourceId,
        resourceLabel: entry.resourceLabel?.slice(0, 200),
        summary: entry.summary.slice(0, 1000),
        changes: entry.changes ?? [],
        ...actor,
        ipAddress: entry.ip ?? info.ip,
        userAgent: entry.userAgent ?? info.userAgent,
      } as never,
      overrideAccess: true,
      depth: 0,
      ...(entry.transactional && entry.req ? { req: entry.req } : {}),
    });

  if (entry.transactional && STRICT) {
    // Data changes: if the log row can't be written, the change is rolled back.
    await write();
    return;
  }
  try {
    await write();
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `activity-log write failed (${entry.action})`,
    });
  }
}

/* ── Hook factories ────────────────────────────────────────────────── */

const labelOf = (slug: string, doc: Doc | null | undefined): string => {
  const preferred = LABEL_FIELD[slug];
  const value =
    (preferred && doc?.[preferred]) ??
    doc?.title ??
    doc?.name ??
    doc?.organisation ??
    doc?.organisationName ??
    doc?.email ??
    doc?.slug ??
    doc?.reference ??
    doc?.filename ??
    doc?.id;
  return String(value ?? "").slice(0, 160);
};

const summarise = (
  verb: string,
  noun: string,
  label: string,
  changes: Change[],
) => {
  const names = changes.map((c) => c.field).slice(0, 8);
  const more =
    changes.length > names.length
      ? ` (+${changes.length - names.length} more)`
      : "";
  return `${verb} ${noun}${label ? ` “${label}”` : ""}${names.length ? ` — ${names.join(", ")}${more}` : ""}`;
};

async function tooManyFailures(
  payload: Payload,
  ip?: string,
): Promise<boolean> {
  // Stops a login-guessing attack from filling the log with thousands of rows.
  try {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const result = await payload.count({
      collection: "activity-log" as never,
      where: {
        and: [
          { action: { in: ["login_failed", "account_locked"] } },
          { createdAt: { greater_than: since } },
          ...(ip ? [{ ipAddress: { equals: ip } }] : []),
        ],
      } as never,
      overrideAccess: true,
    });
    return result.totalDocs >= 15;
  } catch {
    return false;
  }
}

export function withActivityLog(config: CollectionConfig): CollectionConfig {
  if (EXCLUDED.has(config.slug)) return config;

  const slug = config.slug;
  const policy: Policy = POLICIES[slug] ?? { mode: "values" };
  const noun =
    typeof config.labels?.singular === "string" ? config.labels.singular : slug;
  const hooks = config.hooks ?? {};

  const afterChange: CollectionAfterChangeHook = async ({
    doc,
    previousDoc,
    operation,
    req,
  }) => {
    if ((req?.context as Doc | undefined)?.skipActivityLog) return doc;
    const created = operation === "create";
    const changes = created
      ? snapshotDoc(doc, policy)
      : diffDocs(previousDoc, doc, policy);
    // A submitted password never appears in `doc`; note that it changed, never its value.
    if (config.auth && (req as unknown as { data?: Doc })?.data?.password)
      changes.push({ field: "password", changed: true });
    if (!created && changes.length === 0) return doc; // nothing meaningful changed (e.g. login bookkeeping)

    const label = labelOf(slug, doc);
    await logActivity(req.payload, {
      action: created ? "create" : "update",
      resourceType: "collection",
      resource: slug,
      resourceId: String(doc.id),
      resourceLabel: label,
      summary: summarise(created ? "Created" : "Updated", noun, label, changes),
      changes,
      req,
      transactional: true,
    });
    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req, id }) => {
    const changes = snapshotDoc(doc, policy);
    const label = labelOf(slug, doc);
    await logActivity(req.payload, {
      action: "delete",
      resourceType: "collection",
      resource: slug,
      resourceId: String(id ?? doc?.id),
      resourceLabel: label,
      summary: `Deleted ${noun}${label ? ` “${label}”` : ""}`,
      changes,
      req,
      transactional: true,
    });
    return doc;
  };

  const next: CollectionConfig["hooks"] = {
    ...hooks,
    afterChange: [...(hooks.afterChange ?? []), afterChange],
    afterDelete: [...(hooks.afterDelete ?? []), afterDelete],
  };

  if (config.auth) {
    const accountResource = {
      resourceType: "account" as const,
      resource: slug,
    };

    const afterLogin: CollectionAfterLoginHook = async ({ user, req }) => {
      await logActivity(req.payload, {
        ...accountResource,
        action: "login",
        resourceId: String(user.id),
        resourceLabel: user.email,
        summary: `Signed in (${slug === "users" ? "staff" : "member"})`,
        req,
        user: { ...user, collection: slug },
      });
      return user;
    };

    const afterLogout: CollectionAfterLogoutHook = async ({ req }) => {
      if (!req?.user) return;
      await logActivity(req.payload, {
        ...accountResource,
        action: "logout",
        resourceId: String(req.user.id),
        resourceLabel: req.user.email,
        summary: "Signed out",
        req,
      });
    };

    const afterForgotPassword: CollectionAfterForgotPasswordHook = async ({
      args,
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = args as any;
      const email = String(a?.data?.email ?? "").slice(0, 200);
      if (!a?.req?.payload) return;
      await logActivity(a.req.payload, {
        ...accountResource,
        action: "password_reset_requested",
        resourceLabel: email,
        summary: `Password reset requested for ${email || "unknown address"}`,
        req: a.req,
        actor: {
          actorType: "public",
          actorName: "Public visitor",
          actorEmail: email,
        },
      });
    };

    const afterError: CollectionAfterErrorHook = async ({ req, error }) => {
      try {
        const pathname = String(
          (req as unknown as { pathname?: string }).pathname ??
            new URL(String(req.url)).pathname,
        );
        if (!pathname.endsWith(`/${slug}/login`)) return;
        const errorName = String((error as Doc)?.name ?? "");
        const locked = errorName === "LockedAuth";
        const { ip } = requestInfo(req);
        if (await tooManyFailures(req.payload, ip)) return;
        const email = String(
          (req as unknown as { data?: Doc }).data?.email ?? "",
        ).slice(0, 200);
        await logActivity(req.payload, {
          ...accountResource,
          action: locked ? "account_locked" : "login_failed",
          resourceLabel: email,
          summary: locked
            ? `Sign-in refused: account locked (${email})`
            : `Failed sign-in attempt (${email || "no email given"})`,
          req,
          actor: {
            actorType: "public",
            actorName: "Not signed in",
            actorEmail: email,
          },
        });
      } catch {
        /* logging must never change how an error is reported */
      }
    };

    next.afterLogin = [...(hooks.afterLogin ?? []), afterLogin];
    next.afterLogout = [...(hooks.afterLogout ?? []), afterLogout];
    next.afterForgotPassword = [
      ...(hooks.afterForgotPassword ?? []),
      afterForgotPassword,
    ];
    next.afterError = [...(hooks.afterError ?? []), afterError];
  }

  return { ...config, hooks: next };
}

export function withActivityLogGlobal(config: GlobalConfig): GlobalConfig {
  const slug = config.slug;
  const policy: Policy = POLICIES[slug] ?? { mode: "values" };
  const noun = typeof config.label === "string" ? config.label : slug;
  const hooks = config.hooks ?? {};

  const afterChange: GlobalAfterChangeHook = async ({
    doc,
    previousDoc,
    req,
  }) => {
    if ((req?.context as Doc | undefined)?.skipActivityLog) return doc;
    const changes = diffDocs(previousDoc, doc, policy);
    if (changes.length === 0) return doc;
    await logActivity(req.payload, {
      action: "update",
      resourceType: "global",
      resource: slug,
      resourceLabel: noun,
      summary: summarise("Updated", "page/settings", noun, changes),
      changes,
      req,
      transactional: true,
    });
    return doc;
  };

  return {
    ...config,
    hooks: {
      ...hooks,
      afterChange: [...(hooks.afterChange ?? []), afterChange],
    },
  };
}
