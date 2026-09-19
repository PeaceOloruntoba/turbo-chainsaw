import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AccountShell } from '@/components/AccountShell'
import { LoginForm } from '@/components/AccountForms'
import { getPortalConfig } from '@/lib/portal'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } }

const safeNext = (next?: string) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/account')

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const portal = await getPortalConfig()
  if (!portal.enabled) notFound()

  const { next } = await searchParams
  const viewer: any = await getViewer()
  if (viewer?.collection === 'members') redirect(safeNext(next))

  return (
    <AccountShell title="Sign in" intro="Access Nigeria Lex research and intelligence available to your account.">
      <LoginForm next={next} />
      {portal.registrationOpen && (
        <p className="mt-8 text-sm text-slate">
          New to Nigeria Lex?{' '}
          <Link href="/account/register" className="font-medium text-green">
            Create an account
          </Link>
          .
        </p>
      )}
    </AccountShell>
  )
}
