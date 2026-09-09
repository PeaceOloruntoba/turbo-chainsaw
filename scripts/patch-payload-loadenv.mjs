// Works around an open upstream Payload bug (payloadcms/payload#16674,
// #16341): payload/dist/bin/loadEnv.js does
//   const { loadEnvConfig } = import_env.default
// but @next/env's CJS bundle sets __esModule: true without ever actually
// assigning a `.default` property, so `.default` is undefined and this
// destructure throws — "Cannot destructure property 'loadEnvConfig' of
// 'import_env.default' as it is undefined". This fires any time Payload's
// Local API is used outside a live Next.js server (our seed script, any
// future migration script), regardless of how *we* load env vars.
//
// This patch is intentionally tolerant: if the upstream file has already
// fixed this (a newer `payload` version), the pattern below won't match
// and this becomes a safe no-op rather than a broken patch.
//
// Runs automatically via the "postinstall" script in package.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const target = 'node_modules/payload/dist/bin/loadEnv.js'

if (!existsSync(target)) {
  console.log('[patch-payload-loadenv] target not found, skipping (payload not installed?)')
  process.exit(0)
}

const original = readFileSync(target, 'utf8')

const buggyPattern = /const\s*\{\s*loadEnvConfig\s*\}\s*=\s*import_env\.default\s*;?/

if (!buggyPattern.test(original)) {
  console.log(
    '[patch-payload-loadenv] expected buggy line not found — either already patched, or payload has fixed this upstream. Skipping (safe no-op).',
  )
  process.exit(0)
}

const patched = original.replace(
  buggyPattern,
  'const { loadEnvConfig } = import_env.default || import_env;',
)

writeFileSync(target, patched)
console.log('[patch-payload-loadenv] patched node_modules/payload/dist/bin/loadEnv.js successfully')
