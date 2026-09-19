import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AccountShell } from '@/components/AccountShell'
import { ForgotPasswordForm } from '@/components/AccountForms'
import { getPortalConfig } from '@/lib/portal'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Reset password', robots: { index: false, follow: false } }

export default async function ForgotPasswordPage() {
  const portal = await getPortalConfig()
  if (!portal.enabled) notFound()

  return (
    <AccountShell title="Reset your password" intro="Enter your email address and we will send you a link to choose a new password.">
      <ForgotPasswordForm />
    </AccountShell>
  )
}
