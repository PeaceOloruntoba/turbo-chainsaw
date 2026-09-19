import type { Access, FieldAccess } from 'payload'

/**
 * Central access-control helpers for Nigeria Lex.
 *
 * WHY THIS FILE EXISTS
 * Before this change most collections used `Boolean(user)` as "is staff".
 * That was safe while only `users` could log in. Now there are several
 * separate login populations that all share Payload's `req.user`:
 *
 *   users    → staff: admin / editor / researcher / commercial_* roles
 *   members  → public-site accounts (registered / subscriber / institutional)
 *
 * A logged-in *member* must never be treated as staff, and a *commercial
 * register* user (e.g. SBM) must never be treated as CMS staff. Every
 * access rule in the project therefore goes through the helpers below, which
 * always check `user.collection` and the role.
 *
 * Suspended staff (`active === false`) and suspended members
 * (`status === 'suspended'`) lose all access immediately, even if their
 * session cookie is still valid, because these helpers are evaluated on
 * every request against the freshly-loaded user document.
 */

export type AccessLevel = 'public' | 'registered' | 'subscriber'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyUser = ({ collection?: string } & Record<string, any>) | null | undefined

const LEVEL_RANK: Record<AccessLevel, number> = {
  public: 0,
  registered: 1,
  subscriber: 2,
}

/** Staff roles that may work on website content and audience data. */
export const CONTENT_ROLES = ['admin', 'editor', 'researcher'] as const
/** Roles that may see the Commercial Register. */
export const REGISTER_VIEW_ROLES = ['admin', 'commercial_editor', 'commercial_viewer'] as const
/** Roles that may create / amend Commercial Register entries. */
export const REGISTER_EDIT_ROLES = ['admin', 'commercial_editor'] as const

/* ── Who is this? ─────────────────────────────────────────────────── */

/** A staff account (users collection) that has not been suspended. */
export const isStaff = (user: AnyUser): boolean =>
  user?.collection === 'users' && user.active !== false

/** K&C / Nigeria Lex super administrator. */
export const isAdmin = (user: AnyUser): boolean => isStaff(user) && user?.role === 'admin'

/** Admin, editor or researcher: may work on CMS content and audience data. */
export const isContentTeam = (user: AnyUser): boolean =>
  isStaff(user) && (CONTENT_ROLES as readonly string[]).includes(user?.role)

export const canViewRegister = (user: AnyUser): boolean =>
  isStaff(user) && (REGISTER_VIEW_ROLES as readonly string[]).includes(user?.role)

export const canEditRegister = (user: AnyUser): boolean =>
  isStaff(user) && (REGISTER_EDIT_ROLES as readonly string[]).includes(user?.role)

/** A member account (public portal) that has not been suspended. */
export const isMember = (user: AnyUser): boolean =>
  user?.collection === 'members' && user.status !== 'suspended'

/* ── Content access levels (public / registered / subscriber) ─────── */

/** The access level a *document* requires. Falls back to the legacy
 * `isSubscriberOnly` checkbox for rows created before `accessLevel` existed. */
export function levelOf(
  doc: { accessLevel?: string | null; isSubscriberOnly?: boolean | null } | null | undefined,
): AccessLevel {
  const level = doc?.accessLevel
  if (level === 'public' || level === 'registered' || level === 'subscriber') return level
  return doc?.isSubscriberOnly ? 'subscriber' : 'public'
}

/** The access level a *viewer* currently holds. */
export function effectiveLevel(user: AnyUser): AccessLevel {
  // Internal content team can see everything (needed to edit it).
  if (isContentTeam(user)) return 'subscriber'

  if (isMember(user)) {
    if (user?.accessLevel === 'subscriber') {
      const expires = user.subscription?.expiresAt
      if (!expires || new Date(expires).getTime() > Date.now()) return 'subscriber'
    }
    return 'registered'
  }

  return 'public'
}

export const canAccessLevel = (required: AccessLevel, user: AnyUser): boolean =>
  LEVEL_RANK[effectiveLevel(user)] >= LEVEL_RANK[required]

/** All content levels this viewer may read (for building `where` clauses). */
export const allowedLevelsFor = (user: AnyUser): AccessLevel[] => {
  const rank = LEVEL_RANK[effectiveLevel(user)]
  return (Object.keys(LEVEL_RANK) as AccessLevel[]).filter((l) => LEVEL_RANK[l] <= rank)
}

/* ── Ready-made Access functions ──────────────────────────────────── */

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)
export const contentTeamOnly: Access = ({ req: { user } }) => isContentTeam(user)

export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdmin(user)
export const contentTeamField: FieldAccess = ({ req: { user } }) => isContentTeam(user)

/** Field-level gate: the field is only returned when the viewer's level is
 * high enough for THIS document's `accessLevel`. */
export const gatedByDocumentLevel: FieldAccess = ({ req: { user }, doc }) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canAccessLevel(levelOf(doc as any), user)

/* ── Small helpers used by audit logging ──────────────────────────── */

export const userDisplayName = (user: AnyUser): string =>
  (user?.name as string) || (user?.email as string) || 'System'

/** 'sbm' for SBM Intelligence accounts, otherwise 'kc' (K&C / Nigeria Lex). */
export const userOrganisationCode = (user: AnyUser): 'kc' | 'sbm' =>
  user?.organisation === 'sbm' ? 'sbm' : 'kc'
