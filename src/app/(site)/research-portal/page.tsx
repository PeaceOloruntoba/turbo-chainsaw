import { ResearchPortal } from '@/components/ResearchPortal'
export const dynamic='force-dynamic'
export const metadata={title:'Research Portal',robots:{index:false,follow:false}}
export default async function Page({searchParams}:{searchParams:Promise<{token?:string;invite?:string}>}){const q=await searchParams;return <ResearchPortal token={q.token||q.invite||''}/>}