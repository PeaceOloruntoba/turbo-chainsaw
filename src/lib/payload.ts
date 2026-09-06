import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Returns a Payload Local API instance. Payload memoizes this internally
 * per Node process, so it is safe to call from any Server Component or
 * Route Handler without standing up a fresh connection each time.
 */
export const getPayloadClient = async () => getPayload({ config })
