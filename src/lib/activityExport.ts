import type { Endpoint, PayloadRequest, Where } from "payload";
import { isAdmin } from "../access";
import { logActivity } from "./activity";
import { toCsv } from "./commercial";

/**
 * GET /api/activity-log/export — CSV of the site-wide activity log
 * (Super Administrators only). Honours the same search / filters / sort as
 * the admin list, and the export itself is recorded in the log.
 */
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const SEARCH_FIELDS = [
  "summary",
  "actorName",
  "actorEmail",
  "resourceLabel",
  "resource",
  "ipAddress",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>;

function buildWhere(req: PayloadRequest): Where {
  const params = new URL(String(req.url)).searchParams;
  const and: Where[] = [];
  const rawWhere = (req as unknown as { query?: Record<string, unknown> }).query
    ?.where;
  if (rawWhere && typeof rawWhere === "object") and.push(rawWhere as Where);
  const search = params.get("search")?.trim();
  if (search)
    and.push({
      or: SEARCH_FIELDS.map((field) => ({ [field]: { like: search } })),
    });
  return and.length ? { and } : {};
}

export const activityExportHandler: Endpoint["handler"] = async (req) => {
  if (!isAdmin(req.user))
    return Response.json(
      { error: "Forbidden" },
      { status: 403, headers: NO_STORE },
    );

  try {
    const params = new URL(String(req.url)).searchParams;
    const rawSort = params.get("sort");
    const sort =
      rawSort && /^-?[A-Za-z][A-Za-z0-9_.]*$/.test(rawSort)
        ? rawSort
        : "-createdAt";
    const where = buildWhere(req);

    const docs: Doc[] = [];
    for (let page = 1; page <= 400; page += 1) {
      const result = await req.payload.find({
        collection: "activity-log" as never,
        where,
        sort,
        limit: 500,
        page,
        depth: 0,
        overrideAccess: false,
        user: req.user,
      });
      docs.push(...(result.docs as Doc[]));
      if (!result.hasNextPage) break;
    }

    const csv = toCsv(
      [
        "Time (UTC)",
        "Action",
        "Area",
        "Record",
        "Record ID",
        "Summary",
        "Who",
        "Who (type)",
        "Email",
        "Role",
        "Organisation",
        "IP address (as reported by host)",
        "Browser",
        "Changes (JSON)",
      ],
      docs.map((d) => [
        d.createdAt,
        d.action,
        d.resource,
        d.resourceLabel,
        d.resourceId,
        d.summary,
        d.actorName,
        d.actorType,
        d.actorEmail,
        d.actorRole,
        d.actorOrganisation === "sbm"
          ? "SBM"
          : d.actorOrganisation === "kc"
            ? "K&C / Nigeria Lex"
            : "",
        d.ipAddress,
        d.userAgent,
        JSON.stringify(d.changes ?? []),
      ]),
    );

    await logActivity(req.payload, {
      action: "export",
      resourceType: "system",
      resource: "activity-log",
      summary: `Exported ${docs.length} activity-log rows to CSV`,
      req,
    });

    return new Response(csv, {
      status: 200,
      headers: {
        ...NO_STORE,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="nigeria-lex-activity-log-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    req.payload.logger.error({ err: error, msg: "activity-log export failed" });
    return Response.json(
      { error: "Export failed" },
      { status: 500, headers: NO_STORE },
    );
  }
};
