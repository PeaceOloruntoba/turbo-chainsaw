// CLI entry point for seeding — kept as an alternative for environments
// that don't hit the Windows/Node payload-CLI bug (see README
// Troubleshooting). On Windows, prefer the /api/seed route instead:
// it runs inside a live `next dev` process, which sidesteps the bug
// entirely. See README "Seeding content" for both options.
import { getPayload } from 'payload'
import config from '../payload.config'
import { runSeed } from './runSeed'

async function main() {
  const payload = await getPayload({ config })
  const summary = await runSeed(payload)
  payload.logger.info(summary)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})