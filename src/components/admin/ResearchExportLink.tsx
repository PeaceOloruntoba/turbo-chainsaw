'use client'
import React from 'react'
export const ResearchExportLink:React.FC=()=> <div style={{margin:'0 0 20px'}}><a href="/api/research-portal/export" style={{display:'inline-block',padding:'8px 14px',border:'1px solid var(--theme-elevation-300)',borderRadius:4,fontSize:13,textDecoration:'none',color:'var(--theme-text)'}}>Export all research submissions (CSV)</a><span style={{marginLeft:12,fontSize:12,opacity:.7}}>Includes structured responses and supporting document references. SBM reviewers may export.</span></div>
export default ResearchExportLink