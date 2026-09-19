// Standalone CLI entry point for promoteToAdmin() (see makeAdmin.ts).
//
// On Windows + Node 22+, this currently crashes with
// ERR_REQUIRE_ASYNC_MODULE / "Cannot destructure property 'loadEnvConfig'
// of 'import_env.default' as it is undefined" — an open upstream bug in
// Payload's CLI bootstrap's @next/env interop, the same one already
// affecting `npm run seed` (see README Troubleshooting).
//
// On Windows, use the live-server route instead — it sidesteps this
// entirely by letting Next's own bundler load the config. Set SEED_SECRET
// in .env (a value different from PAYLOAD_SECRET), then:
//   curl -X POST -H "x-seed-secret: YOUR_SEED_SECRET" "http://localhost:3000/api/seed?action=make-admin&email=you@nigerialex.com"
//
// Elsewhere, this CLI works fine:
//   npm run make-admin -- you@nigerialex.com

import { getPayload } from "payload";
import config from "../payload.config";
import { promoteToAdmin } from "./makeAdmin";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Usage: tsx src/seed/makeAdminCli.ts <email>");
    process.exit(1);
  }

  const payload = await getPayload({ config });
  const result = await promoteToAdmin(payload, email);

  if (result.status === "not-found") {
    console.error(
      `No user found with email "${result.email}". Check it matches exactly what you used to sign up at /admin.`,
    );
    process.exit(1);
  }

  if (result.status === "already-admin") {
    console.log(`${result.email} is already an admin — nothing to do.`);
    process.exit(0);
  }

  console.log(
    `Done — ${result.email} is now an admin. Log out and back in at /admin for it to take effect.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
