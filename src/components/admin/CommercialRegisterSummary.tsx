'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Shown above the Commercial Register list in the admin panel:
 *  • simple dashboard totals (per currency — currencies are never mixed)
 *  • "Export CSV" buttons (opens in Excel). The register export carries over
 *    whatever search / filters / sort are currently applied to the list.
 *
 * Data comes from GET /api/commercial-register/summary, which re-checks the
 * caller's role on the server — this component is presentation only.
 */

type PartyTotals = { count: number; pipeline: number; agreed: number; invoiced: number; received: number }
type Bucket = {
  pipeline: number
  agreed: number
  invoiced: number
  received: number
  outstanding: number
  byParty: Record<string, PartyTotals>
}
type Summary = {
  records: number
  byStatus: Record<string, number>
  byParty: Record<string, number>
  byCurrency: Record<string, Bucket>
}

const PARTY_LABELS: Record<string, string> = {
  kc_nigeria_lex: 'K&C / Nigeria Lex',
  sbm: 'SBM',
  joint: 'Joint',
}

const money = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${currency} ${Math.round(value).toLocaleString('en-GB')}`
  }
}

const card: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-elevation-50)',
  borderRadius: 4,
  padding: '12px 14px',
  minWidth: 150,
}
const label: React.CSSProperties = { fontSize: 12, opacity: 0.7, marginBottom: 4 }
const value: React.CSSProperties = { fontSize: 18, fontWeight: 600 }
const button: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 14px',
  border: '1px solid var(--theme-elevation-300)',
  borderRadius: 4,
  fontSize: 13,
  textDecoration: 'none',
  color: 'var(--theme-text)',
  background: 'var(--theme-elevation-0)',
}

export const CommercialRegisterSummary: React.FC = () => {
  const searchParams = useSearchParams()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/commercial-register/summary', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Summary) => !cancelled && setSummary(data))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [])

  // Carry the list's current search / filters / sort into the export link.
  const exportHref = useMemo(() => {
    const out = new URLSearchParams()
    searchParams?.forEach((v, k) => {
      if (k === 'search' || k === 'sort' || k.startsWith('where')) out.append(k, v)
    })
    const qs = out.toString()
    return `/api/commercial-register/export${qs ? `?${qs}` : ''}`
  }, [searchParams])

  const currencies = summary ? Object.keys(summary.byCurrency) : []

  return (
    <div style={{ margin: '0 0 24px' }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <a href={exportHref} style={button}>
          Export register (CSV / Excel)
        </a>
        <a href="/api/commercial-register/export?dataset=audit" style={button}>
          Export audit trail (CSV)
        </a>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          Exports respect the search and filters applied below and are recorded in the audit trail.
        </span>
      </div>

      {error && <p style={{ fontSize: 13, opacity: 0.7 }}>Dashboard totals are unavailable right now.</p>}
      {!summary && !error && <p style={{ fontSize: 13, opacity: 0.7 }}>Loading dashboard…</p>}

      {summary && (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={card}>
              <div style={label}>Active entries</div>
              <div style={value}>{summary.records}</div>
            </div>
            {Object.entries(PARTY_LABELS).map(([key, name]) => (
              <div style={card} key={key}>
                <div style={label}>{name}-originated</div>
                <div style={value}>{summary.byParty[key] ?? 0}</div>
              </div>
            ))}
          </div>

          {currencies.length === 0 && <p style={{ fontSize: 13, opacity: 0.7 }}>No active entries yet.</p>}

          {currencies.map((currency) => {
            const b = summary.byCurrency[currency]
            return (
              <div key={currency} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Totals in {currency}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={card}>
                    <div style={label}>Pipeline (open)</div>
                    <div style={value}>{money(b.pipeline, currency)}</div>
                  </div>
                  <div style={card}>
                    <div style={label}>Agreed value</div>
                    <div style={value}>{money(b.agreed, currency)}</div>
                  </div>
                  <div style={card}>
                    <div style={label}>Invoiced</div>
                    <div style={value}>{money(b.invoiced, currency)}</div>
                  </div>
                  <div style={card}>
                    <div style={label}>Received</div>
                    <div style={value}>{money(b.received, currency)}</div>
                  </div>
                  <div style={card}>
                    <div style={label}>Outstanding</div>
                    <div style={value}>{money(b.outstanding, currency)}</div>
                  </div>
                </div>
                <table style={{ fontSize: 12, marginTop: 8, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Originating party', 'Entries', 'Pipeline', 'Agreed', 'Invoiced', 'Received'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '4px 14px 4px 0', opacity: 0.7 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(b.byParty).map(([party, t]) => (
                      <tr key={party}>
                        <td style={{ padding: '3px 14px 3px 0' }}>{PARTY_LABELS[party] ?? party}</td>
                        <td style={{ padding: '3px 14px 3px 0' }}>{t.count}</td>
                        <td style={{ padding: '3px 14px 3px 0' }}>{money(t.pipeline, currency)}</td>
                        <td style={{ padding: '3px 14px 3px 0' }}>{money(t.agreed, currency)}</td>
                        <td style={{ padding: '3px 14px 3px 0' }}>{money(t.invoiced, currency)}</td>
                        <td style={{ padding: '3px 14px 3px 0' }}>{money(t.received, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default CommercialRegisterSummary
