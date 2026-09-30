import { readFile } from 'node:fs/promises'
import { createDecipheriv } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const file=process.argv[2]
const key=Buffer.from(process.env.RESEARCH_BACKUP_KEY||'','base64')
if(!file||key.length!==32){console.error('Usage: npm run restore:research -- <backup.nlbackup> (set RESEARCH_BACKUP_KEY first)');process.exit(1)}
const raw=await readFile(file)
if(raw.subarray(0,5).toString()!=='NLRS1'){console.error('Unknown backup format.');process.exit(1)}
const iv=raw.subarray(5,17),tag=raw.subarray(raw.length-16),body=raw.subarray(17,raw.length-16)
const decipher=createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(tag)
const snapshot=JSON.parse(gunzipSync(Buffer.concat([decipher.update(body),decipher.final()])).toString())
const payload=await getPayload({config})
const current=await payload.count({collection:'research-participants',overrideAccess:true})
if(current.totalDocs){console.error('Restore stopped: destination already has research participants. Restore into an empty research database/schema.');process.exit(2)}
const participantMap=new Map<string,string>(),submissionMap=new Map<string,string>(),documentMap=new Map<string,string>()
for(const old of snapshot.participants||[]){const {id,createdAt,updatedAt,...data}=old;const saved:any=await payload.create({collection:'research-participants',data,overrideAccess:true,context:{skipResearchInvite:true,skipActivityLog:true}});participantMap.set(String(id),String(saved.id))}
for(const old of snapshot.submissions||[]){const {id,createdAt,updatedAt,...rest}=old;const data:any={...rest,participant:participantMap.get(String(typeof rest.participant==='object'?rest.participant.id:rest.participant))};delete data.documents;const saved:any=await payload.create({collection:'research-portal-submissions',data,overrideAccess:true});submissionMap.set(String(id),String(saved.id))}
const files=new Map((snapshot.files||[]).map((f:any)=>[f.filename,f]))
for(const old of snapshot.documents||[]){const f:any=files.get(old.filename);if(!f)throw new Error(`Backup has metadata but no bytes for ${old.filename}`);const participant=participantMap.get(String(typeof old.participant==='object'?old.participant.id:old.participant));const submission=submissionMap.get(String(typeof old.submission==='object'?old.submission.id:old.submission));const bytes=Buffer.from(f.data,'base64');const saved:any=await payload.create({collection:'research-documents',data:{title:old.title,participant,submission},file:{data:bytes,mimetype:old.mimeType||f.mimeType,name:old.filename,size:bytes.length},overrideAccess:true} as any);documentMap.set(String(old.id),String(saved.id))}
for(const old of snapshot.submissions||[]){const id=submissionMap.get(String(old.id));const docs=(old.documents||[]).map((x:any)=>documentMap.get(String(typeof x==='object'?x.id:x))).filter(Boolean);if(id&&docs.length)await payload.update({collection:'research-portal-submissions',id,data:{documents:docs},overrideAccess:true})}
if(snapshot.settings){const {id,createdAt,updatedAt,...data}=snapshot.settings;await payload.updateGlobal({slug:'research-portal-settings',data,overrideAccess:true})}
console.log(`Restored ${participantMap.size} firms, ${submissionMap.size} submissions, and ${documentMap.size} files.`)