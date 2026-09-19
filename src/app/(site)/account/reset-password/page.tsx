import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AccountShell } from '@/components/AccountShell'
import { ResetPasswordForm } from '@/components/AccountForms'
import { getPortalConfig } from '@/lib/portal'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Choose a new password',
  robots: { index: false, follow: false },
  referrer: 'no-referrer', // the reset token is in the URL — never leak it via Referer
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const portal = await getPortalConfig()
  if (!portal.enabled) notFound()

  const { token } = await searchParams
  if (!token) {
    return (
      <AccountShell title="Link not valid" intro="This password reset link is incomplete. Please request a new one.">
        <Link href="/account/forgot-password" className="font-medium text-green">
          Request a new link
        </Link>
      </AccountShell>
    )
  }

  return (
    <AccountShell title="Choose a new password">
      <ResetPasswordForm token={token} />
    </AccountShell>
  )
}
