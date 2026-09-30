'use client'
import React from 'react'
const links=[['Submissions','submissions'],['Representative matters','matters'],['Practitioners','practitioners']]
export const ResearchExportLink:React.FC=()=> <div style={{margin:'0 0 20px',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>{links.map(([label,type])=><a key={type} href={`/api/research-portal/export?type=${type}`} style={{display:'inline-block',padding:'8px 14px',border:'1px solid var(--theme-elevation-300)',borderRadius:4,fontSize:13,textDecoration:'none',color:'var(--theme-text)'}}>Export {label} (CSV)</a>)}<span style={{fontSize:12,opacity:.7}}>Opens in Excel. Exports are recorded.</span></div>
export default ResearchExportLink