import { getPayloadClient } from './payload'

/**
 * Feature flags for the member portal, controlled from
 * /admin → Site Settings → Member portal. Both default to OFF, so shipping
 * this code changes nothing on the live site until an administrator switches
 * the portal on.
 */
export async function getPortalConfig(): Promise<{ enabled: boolean; registrationOpen: boolean }> {
  try {
    const payload = await getPayloadClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings: any = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const enabled = Boolean(settings?.memberPortal?.enabled)
    return { enabled, registrationOpen: enabled && Boolean(settings?.memberPortal?.registrationOpen) }
  } catch {
    return { enabled: false, registrationOpen: false }
  }
}
