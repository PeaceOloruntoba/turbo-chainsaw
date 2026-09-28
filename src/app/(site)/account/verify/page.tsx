import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell } from "@/components/AccountShell";
import { getPayloadClient } from "@/lib/payload";
import { getPortalConfig } from "@/lib/portal";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

async function verify(token?: string): Promise<"ok" | "invalid"> {
  if (!token) return "invalid";
  try {
    const payload = await getPayloadClient();

    // Find out whose token this is before it is consumed, so the activity log can name them.
    let member: { id: string | number; email?: string } | null = null;
    try {
      const found = await payload.find({
        collection: "members",
        where: { _verificationToken: { equals: token } } as never,
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      member =
        (found.docs[0] as
          { id: string | number; email?: string } | undefined) ?? null;
    } catch {
      /* fall back to an anonymous log entry */
    }

    const ok = await payload.verifyEmail({ collection: "members", token });
    if (ok) {
      await logActivity(payload, {
        action: "email_verified",
        resourceType: "account",
        resource: "members",
        resourceId: member ? String(member.id) : undefined,
        resourceLabel: member?.email,
        summary: `Member email address verified${member?.email ? ` (${member.email})` : ""}`,
        actor: {
          actorType: "member",
          actorId: member ? String(member.id) : undefined,
          actorEmail: member?.email,
          actorName: member?.email ?? "Member",
        },
      });
    }
    return ok ? "ok" : "invalid";
  } catch {
    return "invalid";
  }
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const portal = await getPortalConfig();
  if (!portal.enabled) notFound();

  const { token } = await searchParams;
  const result = await verify(token);

  return result === "ok" ? (
    <AccountShell
      title="Email verified"
      intro="Thank you — your account is now active."
    >
      <Link href="/account/login" className="font-medium text-green">
        Sign in
      </Link>
    </AccountShell>
  ) : (
    <AccountShell
      title="Verification link not valid"
      intro="This link is invalid or has already been used. If you have already verified your email, you can sign in."
    >
      <Link href="/account/login" className="font-medium text-green">
        Go to sign in
      </Link>
    </AccountShell>
  );
}
