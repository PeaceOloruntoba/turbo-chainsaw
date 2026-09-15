// Follow-up to scripts/patch-payload-loadenv.mjs.
//
// Same upstream Payload bug (payloadcms/payload#16674, #16341), but this
// installed version of payload/dist/bin/loadEnv.js names the imported
// @next/env module `nextEnvImport` instead of `import_env`, so the original
// patch's regex didn't match it even though the bug is present:
//
//   const { loadEnvConfig } = nextEnvImport;
//
// throws "Cannot destructure property 'loadEnvConfig' of
// 'import_env.default' as it is undefined" for the same reason as before —
// @next/env's CJS bundle sets __esModule: true without ever assigning a
// `.default`, so this needs `nextEnvImport.default || nextEnvImport` instead.
//
// Run this once from the project root:
//   node scripts/patch-payload-loadenv-v2.mjs
// then re-run `npm run seed`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const target = 'node_modules/payload/dist/bin/loadEnv.js'

if (!existsSync(target)) {
  console.log('[patch-payload-loadenv-v2] target not found, skipping (payload not installed?)')
  process.exit(0)
}

const original = readFileSync(target, 'utf8')

// Matches `const { loadEnvConfig } = <identifier>;` for any identifier name,
// as long as it isn't already patched with `.default ||`.
const buggyPattern = /const\s*\{\s*loadEnvConfig\s*\}\s*=\s*([A-Za-z_$][\w$]*)\s*;/

const match = original.match(buggyPattern)

if (!match) {
  console.log(
    '[patch-payload-loadenv-v2] expected buggy line not found — either already patched, or payload has fixed this upstream. Skipping (safe no-op).',
  )
  process.exit(0)
}

const identifier = match[1]

if (original.includes(`${identifier}.default || ${identifier}`)) {
  console.log('[patch-payload-loadenv-v2] already patched, skipping.')
  process.exit(0)
}

const patched = original.replace(
  buggyPattern,
  `const { loadEnvConfig } = ${identifier}.default || ${identifier};`,
)

writeFileSync(target, patched)
console.log(
  `[patch-payload-loadenv-v2] patched node_modules/payload/dist/bin/loadEnv.js successfully (identifier: ${identifier})`,
)
