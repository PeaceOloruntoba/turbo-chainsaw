import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AccountShell } from '@/components/AccountShell'
import { getPayloadClient } from '@/lib/payload'
import { getPortalConfig } from '@/lib/portal'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Verify your email',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

async function verify(token?: string): Promise<'ok' | 'invalid'> {
  if (!token) return 'invalid'
  try {
    const payload = await getPayloadClient()
    const ok = await payload.verifyEmail({ collection: 'members', token })
    return ok ? 'ok' : 'invalid'
  } catch {
    return 'invalid'
  }
}

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const portal = await getPortalConfig()
  if (!portal.enabled) notFound()

  const { token } = await searchParams
  const result = await verify(token)

  return result === 'ok' ? (
    <AccountShell title="Email verified" intro="Thank you — your account is now active.">
      <Link href="/account/login" className="font-medium text-green">
        Sign in
      </Link>
    </AccountShell>
  ) : (
    <AccountShell
      title="Verification link not valid"
      intro="This link is invalid or has already been used. If you have already verified your email, you can sign in."
    >
      <Link href="/account/login" className="font-medium text-green">
        Go to sign in
      </Link>
    </AccountShell>
  )
}
