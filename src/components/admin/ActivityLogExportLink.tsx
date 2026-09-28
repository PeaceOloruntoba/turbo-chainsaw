"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";

/** "Export activity log (CSV)" button; carries over the list's current search / filters / sort. */
export const ActivityLogExportLink: React.FC = () => {
  const searchParams = useSearchParams();
  const href = useMemo(() => {
    const out = new URLSearchParams();
    searchParams?.forEach((v, k) => {
      if (k === "search" || k === "sort" || k.startsWith("where"))
        out.append(k, v);
    });
    const qs = out.toString();
    return `/api/activity-log/export${qs ? `?${qs}` : ""}`;
  }, [searchParams]);

  return (
    <div
      style={{
        margin: "0 0 20px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <a
        href={href}
        style={{
          display: "inline-block",
          padding: "8px 14px",
          border: "1px solid var(--theme-elevation-300)",
          borderRadius: 4,
          fontSize: 13,
          textDecoration: "none",
          color: "var(--theme-text)",
          background: "var(--theme-elevation-0)",
        }}
      >
        Export activity log (CSV / Excel)
      </a>
      <span style={{ fontSize: 12, opacity: 0.7 }}>
        Follows the search and filters below. Exports are themselves recorded.
      </span>
    </div>
  );
};

export default ActivityLogExportLink;
