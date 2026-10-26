import 'dotenv/config'
import { getPayload } from 'payload'

if (!Reflect.set(process.env, 'NODE_ENV', 'development')) {
  throw new Error('Unable to enable Payload schema synchronization.')
}
process.env.PAYLOAD_DB_PUSH = 'true'
process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true'

const { default: config } = await import('../src/payload.config')

try {
  const payload = await getPayload({ config })
  try {
    await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    await payload.findGlobal({
      slug: 'research-portal-settings',
      depth: 0,
      overrideAccess: true,
    })
  } finally {
    await payload.destroy()
  }
  console.info('Payload schema synchronization and verification completed.')
} catch (error) {
  console.error('Payload schema synchronization failed:', error)
  process.exit(1)
}

process.exit(0)
