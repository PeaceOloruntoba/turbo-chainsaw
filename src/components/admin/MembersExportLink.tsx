'use client'

import React from 'react'

/** Small "Export members (CSV)" button shown above the Members list. */
export const MembersExportLink: React.FC = () => (
  <div style={{ margin: '0 0 20px' }}>
    <a
      href="/api/members/export"
      style={{
        display: 'inline-block',
        padding: '8px 14px',
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: 4,
        fontSize: 13,
        textDecoration: 'none',
        color: 'var(--theme-text)',
        background: 'var(--theme-elevation-0)',
      }}
    >
      Export members (CSV / Excel)
    </a>
  </div>
)

export default MembersExportLink
