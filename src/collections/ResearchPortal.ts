import type { CollectionConfig, GlobalConfig } from 'payload'
import { isAdmin, canReviewResearch } from '../access'
import { sendEmail } from '../lib/email'
import { logActivity } from '../lib/activity'
import { createHash, randomBytes } from 'node:crypto'

const hex = (v: string) => createHash('sha256').update(v).digest('hex')
const token = () => randomBytes(32).toString('base64url')
const baseURL = () => process.env.NEXT_PUBLIC_SERVER_URL || 'https://nigerialex.com'

export const ResearchParticipants: CollectionConfig = {
  slug: 'research-participants',
  admin: { group: 'Research Portal', useAsTitle: 'firmName', defaultColumns: ['firmName', 'contactEmail', 'invitationStatus', 'lastActivityAt'], components:{beforeDocumentControls:['@/components/admin/ResearchInviteLink#ResearchInviteLink']} },
  access: {
    admin: ({ req }) => isAdmin(req.user), read: ({ req }) => isAdmin(req.user),
    create: ({ req }) => isAdmin(req.user), update: ({ req }) => isAdmin(req.user), delete: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [async ({ doc, operation, req }) => {
      if (req.context?.skipResearchInvite) return doc
      if (doc.active === false) { if(doc.invitationStatus!=='revoked') await req.payload.update({collection:'research-participants',id:doc.id,data:{invitationStatus:'revoked',invitationHash:null},overrideAccess:true,context:{skipActivityLog:true}}); return doc }
      if (operation !== 'create' && !doc.sendInvite) return doc
      const invite = token()
      await req.payload.update({ collection: 'research-participants', id: doc.id, data: { invitationHash: hex(invite), invitationExpiresAt: new Date(Date.now()+60*86400000).toISOString(), invitationStatus: 'invited', sendInvite: false }, overrideAccess: true, context: { skipActivityLog: true } })
      const url = `${baseURL()}/research-portal?invite=${encodeURIComponent(invite)}`
      await sendEmail({ to: doc.contactEmail, subject: `Invitation to the Nigeria Lex Pilot Study 2026`, text: `Dear ${doc.contactName || doc.firmName},\n\nNigeria Lex invites ${doc.firmName} to complete the confidential Pilot Study 2026 research questionnaire. Use this personal invitation link to begin: ${url}\n\nThe current submission deadline is shown on the Review & Submit page. You can save your progress and return later. Please do not enter legally privileged or highly sensitive confidential information.\n\nNigeria Lex\ninfo@nigerialex.com` })
      await logActivity(req.payload,{action:'system',resourceType:'collection',resource:'research-participants',resourceId:String(doc.id),resourceLabel:doc.firmName,summary:'Invitation sent to '+doc.contactEmail,req})
      const existing = await req.payload.find({collection:'research-portal-submissions',where:{participant:{equals:doc.id}},limit:1,depth:0,overrideAccess:true})
      const form = await req.payload.findGlobal({slug:'research-portal-settings',depth:0,overrideAccess:true}) as any
      const snapshot = {version:form.questionnaireVersion,sections:form.sections,privacyNotice:form.privacyNotice,consentText:form.consentText}
      if(!existing.docs.length){const draft=await req.payload.create({collection:'research-portal-submissions',data:{participant:doc.id,firmName:doc.firmName,status:'invited',answers:{},progress:0,questionnaireSnapshot:snapshot},overrideAccess:true});await req.payload.update({collection:'research-portal-submissions',id:draft.id,data:{reference:'NLPS-'+String(draft.id).replace(/\D/g,'').padStart(4,'0')},overrideAccess:true})}
      else if(doc.sendInvite && existing.docs[0].status==='invited' && !Object.keys(existing.docs[0].answers||{}).length){await req.payload.update({collection:'research-portal-submissions',id:existing.docs[0].id,data:{questionnaireSnapshot:snapshot,firmName:doc.firmName},overrideAccess:true})}
      return doc
    }],
  },
  fields: [
    { name: 'firmName', type: 'text', required: true }, { name: 'contactName', type: 'text' },
    { name: 'contactEmail', type: 'email', required: true, unique: true },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar', description: 'Turn off to revoke this firm’s access immediately.' } },
    { name: 'sendInvite', type: 'checkbox', defaultValue: false, admin: { description: 'Tick and save to send or resend the invitation.' } },
    { name: 'invitationStatus', type: 'select', defaultValue: 'invited', options: ['invited','accepted','revoked'].map(value=>({label:value,value})), admin: { readOnly: true, position: 'sidebar' } },
    { name: 'invitationHash', type: 'text', admin: { hidden: true } }, { name: 'invitationExpiresAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'lastActivityAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'lastReminderAt', type: 'date', admin: { hidden: true } },
    { name: 'reminder3dAt', type: 'date', admin: { hidden: true } },
    { name: 'reminder1dAt', type: 'date', admin: { hidden: true } },
  ],
}

export const ResearchPortalSubmissions: CollectionConfig = {
  slug: 'research-portal-submissions',
  admin: { group: 'Research Portal', useAsTitle: 'reference', defaultColumns: ['reference','firmName','status','progress','updatedAt'], components: { beforeListTable: ['@/components/admin/ResearchExportLink#ResearchExportLink'], beforeDocumentControls: ['@/components/admin/ResearchReviewControls#ResearchReviewControls'] } },
  access: {
    admin: ({ req }) => isAdmin(req.user) || canReviewResearch(req.user),
    read: ({ req }) => isAdmin(req.user) || canReviewResearch(req.user),
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  hooks: { beforeChange:[({data,originalDoc,operation})=>{if(operation==='update'&&originalDoc&&data.status==='returned'&&originalDoc.status!=='returned'){if(!String(data.reopenReason||'').trim())throw new Error('A reason is required to return a submission.');data.submissionHistory=[...(originalDoc.submissionHistory||[]),{answers:originalDoc.answers,questionnaireSnapshot:originalDoc.questionnaireSnapshot,submittedAt:originalDoc.submittedAt,returnedAt:new Date().toISOString(),reason:data.reopenReason}]}return data}], afterRead: [async ({doc,req}) => { if(canReviewResearch(req.user)) await logActivity(req.payload,{action:'system',resourceType:'collection',resource:'research-portal-submissions',resourceId:String(doc.id),resourceLabel:String(doc.reference||doc.firmName),summary:'Viewed research submission '+String(doc.reference||doc.id),req}); return doc }] },
  fields: [
    { name:'reference', type:'text', unique:true, index:true, admin:{readOnly:true,position:'sidebar'} },
    { name:'participant', type:'relationship', relationTo:'research-participants', required:true, admin:{position:'sidebar'} },
    { name:'firmName', type:'text', required:true },
    { name:'status', type:'select', required:true, defaultValue:'draft', options:[{label:'Invited (not started)',value:'invited'},{label:'Draft / In progress',value:'draft'},{label:'Submitted',value:'submitted'},{label:'Under review',value:'under_review'},{label:'Returned for changes',value:'returned'}], admin:{position:'sidebar'} },
    { name:'progress', type:'number', defaultValue:0, admin:{readOnly:true,position:'sidebar'} },
    { name:'answers', type:'json', defaultValue:{}, admin:{description:'Structured answers keyed by questionnaire field ID. Retired field answers are preserved.'} },
    { name:'questionnaireSnapshot', type:'json', admin:{readOnly:true,description:'Questionnaire definition and version used when submitted.'} },
    { name:'submittedAt', type:'date', admin:{readOnly:true,position:'sidebar'} },
    { name:'documents', type:'relationship', relationTo:'research-documents', hasMany:true, admin:{description:'Supporting files uploaded through the private research portal.'} },
    { name:'submissionHistory', type:'json', admin:{readOnly:true,description:'Previous submitted answer versions retained when a submission is reopened.'} },
    { name:'reopenReason', type:'textarea', admin:{description:'Required explanation when an administrator returns a submission for changes.'} },
    { name:'reopenedAt', type:'date', admin:{readOnly:true,position:'sidebar'} },
  ],
}

export const ResearchDocuments: CollectionConfig = {
 slug:'research-documents', labels:{singular:'Research document',plural:'Research documents'}, admin:{group:'Research Portal',useAsTitle:'title',defaultColumns:['title','filename','createdAt']},
 upload:{staticDir:process.env.RESEARCH_UPLOAD_DIR||'storage/research',mimeTypes:['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png']},
 access:{admin:({req})=>isAdmin(req.user)||canReviewResearch(req.user),read:({req})=>isAdmin(req.user)||canReviewResearch(req.user),create:({req})=>isAdmin(req.user),update:({req})=>isAdmin(req.user),delete:({req})=>isAdmin(req.user)},
 hooks:{afterRead:[async ({doc,req})=>{if(canReviewResearch(req.user))await logActivity(req.payload,{action:'system',resourceType:'collection',resource:'research-documents',resourceId:String(doc.id),resourceLabel:String(doc.title||doc.filename),summary:'Viewed or downloaded research document',req});return doc}]}, fields:[{name:'title',type:'text',required:true},{name:'participant',type:'relationship',relationTo:'research-participants',required:true,admin:{readOnly:true}},{name:'submission',type:'relationship',relationTo:'research-portal-submissions',required:true,admin:{readOnly:true}}],
}

export const ResearchAccessTokens: CollectionConfig = {
  slug:'research-access-tokens', admin:{hidden:true},
  access:{admin:()=>false,read:()=>false,create:()=>false,update:()=>false,delete:()=>false},
  fields:[{name:'tokenHash',type:'text',required:true,index:true},{name:'participant',type:'relationship',relationTo:'research-participants',required:true},{name:'expiresAt',type:'date',required:true},{name:'usedAt',type:'date'}],
}

const sections = [
 { title:'Firm Profile', fields:[['firm_type','Firm structure / ownership','select','Private partnership|Limited liability partnership|Limited liability company|Other',true],['founded_year','Year established','number','',true],['office_locations','Nigerian office locations','text','',true],['lawyers_count','Approximate number of practising lawyers','number','',true],['languages','Languages in which the firm can provide legal services','text','',false],['overview','Brief firm overview and principal strengths','textarea','',true]] },
 { title:'Practice Areas', fields:[['practice_areas','Corporate and commercial practice areas','multiselect','Banking & finance|Capital markets|Corporate / M&A|Energy & natural resources|Infrastructure & projects|Dispute resolution|Employment|Fintech|Intellectual property|Real estate|Tax|Telecommunications|Other',true],['sector_strengths','Sectors in which the firm has material experience','textarea','',false],['cross_practice','How do teams collaborate across practice areas?','textarea','',false]] },
 { title:'Representative Matters', repeatable:true, fields:[['matter_name','Matter name or confidential reference','text','',true],['matter_year','Year completed / ongoing','number','',true],['matter_type','Matter type','select','Transaction|Advisory|Dispute|Regulatory|Financing|Project|Other',true],['matter_role','Firm’s role and work performed','textarea','',true],['matter_value','Value / scale (if disclosable)','text','',false],['matter_sector','Client industry / sector','text','',true],['matter_crossborder','Cross-border elements','textarea','',false],['matter_public','May this matter be identified publicly?','select','Yes|No|Anonymised only',true]] },
 { title:'Practitioners', repeatable:true, fields:[['practitioner_name','Practitioner name','text','',true],['practitioner_title','Title / position','text','',true],['practitioner_years','Years in practice','number','',false],['practitioner_areas','Main practice areas','text','',true],['practitioner_education','Education and professional qualifications','textarea','',false],['practitioner_languages','Languages','text','',false]] },
 { title:'Client / Investor Experience', fields:[['client_profile','Typical client profile (without naming clients unless public)','textarea','',true],['investor_work','Experience advising investors or international businesses entering Nigeria','textarea','',false],['client_feedback','How does the firm gather and act on client feedback?','textarea','',false],['client_conflicts','How does the firm manage conflicts and client confidentiality?','textarea','',true]] },
 { title:'Cross-Border Experience', fields:[['jurisdictions','Jurisdictions regularly involved in the firm’s work','textarea','',true],['foreign_counsel','Experience coordinating with foreign counsel','textarea','',false],['regional_networks','Membership of regional or international networks','textarea','',false]] },
 { title:'Evidence & Verification', fields:[['public_sources','Links to public sources supporting your responses','textarea','',false],['awards','Relevant awards, directories or independent recognition','textarea','',false],['verification_contact','Contact for verification follow-up','text','',true],['evidence_notes','Other evidence or context for the research team','textarea','',false],['attribution_permission','May Nigeria Lex identify the firm in research outputs?','select','Yes|No|Anonymised only',true]] },
]

export const ResearchPortalSettings: GlobalConfig = {
 slug:'research-portal-settings', label:'Research Portal Settings', admin:{group:'Research Portal',description:'Configure questionnaire fields, submission window, reminders, privacy copy, and uploads.'}, access:{read:({req})=>isAdmin(req.user)||canReviewResearch(req.user),update:({req})=>isAdmin(req.user)},
 hooks:{beforeChange:[({data,originalDoc,operation})=>{if(operation==='update'&&originalDoc){const changed=data.sections&&JSON.stringify(data.sections)!==JSON.stringify(originalDoc.sections);data.questionnaireVersion=changed?Number(originalDoc.questionnaireVersion||1)+1:Number(originalDoc.questionnaireVersion||1)}return data}]},
 fields:[
  {name:'windowOpensAt',type:'date',required:true,defaultValue:'2026-09-29T23:00:00.000Z',admin:{description:'Use Nigeria time (WAT, UTC+1).'}},
  {name:'windowClosesAt',type:'date',required:true,defaultValue:'2026-10-17T22:59:59.000Z'},
  {name:'remindersEnabled',type:'checkbox',defaultValue:true},
  {name:'uploadsEnabled',type:'checkbox',defaultValue:false,admin:{description:'Private Supabase Storage uploads. Switch off to stop new uploads and downloads.'}},
  {name:'privacyNotice',type:'textarea',defaultValue:'Your responses are collected by Kaye & Crowther Limited through Nigeria Lex for the Nigeria Lex Pilot Study 2026. Responses are confidential and will be available only to authorised Nigeria Lex / K&C personnel and authorised SBM Intelligence researchers supporting the Pilot. Your information will not be made public or sold. It may be used to assess legal capabilities and experience, verify research, and prepare aggregated or attributed research outputs only where you have indicated that attribution is permitted. Drafts and submissions are retained permanently in the Nigeria Lex research environment. Do not include legally privileged or highly sensitive confidential information.'},
  {name:'consentText',type:'textarea',defaultValue:'I confirm that I am authorised to provide this information on behalf of the firm, that it is accurate to the best of my knowledge, and that Nigeria Lex / Kaye & Crowther and authorised SBM Intelligence researchers may use it for the Pilot Study 2026 as described above.'},
  {name:'questionnaireVersion',type:'number',defaultValue:1,admin:{readOnly:true}},
  {name:'sections',type:'array',required:true,defaultValue:sections.map(s=>({id:s.title.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''),title:s.title,repeatable:Boolean(s.repeatable),fields:s.fields.map(([id,label,type,options,required])=>({id,label,type,options,required,active:true}))})),fields:[
   {name:'id',type:'text',required:true,admin:{description:'Stable section key. Keep this unchanged after invitations are sent.'}},{name:'title',type:'text',required:true},{name:'repeatable',type:'checkbox',defaultValue:false},
   {name:'fields',type:'array',fields:[{name:'id',type:'text',required:true},{name:'label',type:'text',required:true},{name:'helpText',type:'text'},{name:'type',type:'select',required:true,options:['text','textarea','email','number','date','url','select','multiselect','checkbox'].map(value=>({label:value,value}))},{name:'options',type:'textarea',admin:{description:'For select/multiselect, enter choices separated by |'}},{name:'required',type:'checkbox',defaultValue:false},{name:'active',type:'checkbox',defaultValue:true}]},
  ]},
 ]
}
