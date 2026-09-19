import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AccountShell } from '@/components/AccountShell'
import { RegisterForm } from '@/components/AccountForms'
import { getPortalConfig } from '@/lib/portal'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Create an account', robots: { index: false, follow: false } }

export default async function RegisterPage() {
  const portal = await getPortalConfig()
  if (!portal.enabled) notFound()

  if (!portal.registrationOpen) {
    return (
      <AccountShell
        title="Registration is not open"
        intro="New accounts are currently created by the Nigeria Lex team. If you would like access, please get in touch."
      >
        <Link href="/contact" className="font-medium text-green">
          Contact Nigeria Lex
        </Link>
      </AccountShell>
    )
  }

  return (
    <AccountShell
      title="Create an account"
      intro="Register for free access to selected Nigeria Lex material. You will need to verify your email address."
    >
      <RegisterForm />
      <p className="mt-8 text-sm text-slate">
        Already registered?{' '}
        <Link href="/account/login" className="font-medium text-green">
          Sign in
        </Link>
        .
      </p>
    </AccountShell>
  )
}
