import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Payload } from 'payload'
import { logActivity } from './activity'

export const COOKIE='nl_research_session'
const secret=()=>process.env.PAYLOAD_SECRET || 'development-only-change-me'
export const hashToken=(v:string)=>createHash('sha256').update(v).digest('hex')
export const randomToken=()=>randomBytes(32).toString('base64url')
const sign=(v:string)=>createHmac('sha256',secret()).update(v).digest('base64url')
export function sessionCookie(participantId:string){const body=Buffer.from(JSON.stringify({id:participantId,exp:Date.now()+7*86400000,nonce:randomToken()})).toString('base64url');return `${body}.${sign(body)}`}
export async function participantSession(payload:Payload, req?:NextRequest){
 const cookie=req?.cookies.get(COOKIE)?.value || (await cookies()).get(COOKIE)?.value
 if(!cookie)return null
 const [body,sig]=cookie.split('.')
 if(!body||!sig)return null
 const expected=sign(body)
 try {if(!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null}catch{return null}
 let session:{id:string;exp:number};try{session=JSON.parse(Buffer.from(body,'base64url').toString())}catch{return null}
 if(session.exp<Date.now())return null
 try {const p=await payload.findByID({collection:'research-participants',id:session.id,depth:0,overrideAccess:true});if(p.active===false||p.invitationStatus==='revoked')return null;return p as any}catch{return null}
}
export function setSession(res:NextResponse, participantId:string){res.cookies.set(COOKIE,sessionCookie(participantId),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:7*86400})}
export function clearSession(res:NextResponse){res.cookies.set(COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0})}
export async function settings(payload:Payload){return await payload.findGlobal({slug:'research-portal-settings',depth:0,overrideAccess:true}) as any}
export function windowOpen(s:any){const n=Date.now();return n>=new Date(s.windowOpensAt).getTime()&&n<=new Date(s.windowClosesAt).getTime()}
export async function logPortal(payload:Payload,req:NextRequest,action:string,summary:string,participant?:any,resourceId?:string){await logActivity(payload,{action:'system',resourceType:'collection',resource:'research-portal-submissions',resourceId,resourceLabel:participant?.firmName||'Research portal',summary,req:req as any,actor:participant?{actorType:'public',actorName:participant.contactName||participant.firmName,actorEmail:participant.contactEmail}:undefined})}
export function jsonError(message:string,status=400){return NextResponse.json({error:message},{status})}
