import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AccountShell } from '@/components/AccountShell'
import { ChangePasswordForm, LogoutButton, ProfileForm } from '@/components/AccountForms'
import { effectiveLevel } from '@/access'
import { getPortalConfig } from '@/lib/portal'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'My account', robots: { index: false, follow: false } }

const LEVEL_LABEL = {
  public: 'Public',
  registered: 'Registered user',
  subscriber: 'Subscriber / institutional user',
} as const

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null

export default async function AccountPage() {
  const portal = await getPortalConfig()
  if (!portal.enabled) notFound()

  const viewer: any = await getViewer()
  if (!viewer || viewer.collection !== 'members') redirect('/account/login?next=/account')

  const level = effectiveLevel(viewer)
  const suspended = viewer.status === 'suspended'
  const expires = formatDate(viewer.subscription?.expiresAt)

  return (
    <AccountShell title="My account" intro={`Signed in as ${viewer.email}`}>
      <section className="rounded-sm border border-line bg-white p-6">
        <h2 className="font-serif text-xl text-navy">Access status</h2>
        <dl className="mt-4 grid gap-3 text-[14px] text-navy-ink sm:grid-cols-2">
          <div>
            <dt className="text-[12px] uppercase tracking-[0.06em] text-slate">Current access</dt>
            <dd className="mt-0.5 font-medium">{suspended ? 'Suspended' : LEVEL_LABEL[level]}</dd>
          </div>
          <div>
            <dt className="text-[12px] uppercase tracking-[0.06em] text-slate">Account type</dt>
            <dd className="mt-0.5 font-medium capitalize">{viewer.accountType || 'individual'}</dd>
          </div>
          {viewer.accountType === 'institutional' && (
            <div>
              <dt className="text-[12px] uppercase tracking-[0.06em] text-slate">Institutional approval</dt>
              <dd className="mt-0.5 font-medium">
                {{ pending: 'Awaiting approval', approved: 'Approved', rejected: 'Not approved', not_required: '—' }[
                  viewer.approvalStatus as string
                ] ?? '—'}
              </dd>
            </div>
          )}
          {viewer.subscription?.plan && viewer.subscription.plan !== 'none' && (
            <div>
              <dt className="text-[12px] uppercase tracking-[0.06em] text-slate">Subscription</dt>
              <dd className="mt-0.5 font-medium capitalize">
                {viewer.subscription.plan}
                {expires ? ` — access until ${expires}` : ''}
              </dd>
            </div>
          )}
        </dl>
        {suspended ? (
          <p className="mt-4 text-[13px] text-red-700">
            This account is suspended. Please <Link href="/contact" className="font-medium underline">contact us</Link>.
          </p>
        ) : (
          level !== 'subscriber' && (
            <p className="mt-4 text-[13px] text-slate">
              Need subscriber or institutional access?{' '}
              <Link href="/contact" className="font-medium text-green">
                Contact us
              </Link>
              .
            </p>
          )
        )}
      </section>

      {!suspended && (
        <>
          <section className="mt-10">
            <h2 className="font-serif text-xl text-navy">Your details</h2>
            <div className="mt-5">
              <ProfileForm member={viewer} />
            </div>
          </section>
          <section className="mt-10 border-t border-line pt-10">
            <h2 className="font-serif text-xl text-navy">Change password</h2>
            <div className="mt-5">
              <ChangePasswordForm memberId={viewer.id} />
            </div>
          </section>
        </>
      )}

      <div className="mt-10 border-t border-line pt-8">
        <LogoutButton />
      </div>
    </AccountShell>
  )
}
