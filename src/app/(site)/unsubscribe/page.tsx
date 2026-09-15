import type { Metadata } from "next";
import { getPayloadClient } from "@/lib/payload";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

async function unsubscribe(token: string | undefined) {
  if (!token) return { status: "missing" as const };

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "subscribers",
      where: { unsubscribeToken: { equals: token } },
      limit: 1,
    });

    const subscriber = result.docs[0];
    if (!subscriber) return { status: "not-found" as const };

    if (!subscriber.unsubscribed) {
      await payload.update({
        collection: "subscribers",
        id: subscriber.id,
        data: { unsubscribed: true },
      });
    }

    return { status: "success" as const, email: subscriber.email as string };
  } catch {
    return { status: "error" as const };
  }
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await unsubscribe(token);

  return (
    <div className="container max-w-lg py-20 text-center">
      {result.status === "success" && (
        <>
          <h1 className="font-serif text-2xl text-navy">
            You&rsquo;ve been unsubscribed.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate">
            {result.email} will no longer receive Nigeria Lex communications. If
            this was a mistake, you can subscribe again at any time.
          </p>
        </>
      )}
      {result.status === "not-found" && (
        <>
          <h1 className="font-serif text-2xl text-navy">
            Link not recognised.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate">
            This unsubscribe link is invalid or has already been used. If
            you&rsquo;re still receiving communications you don&rsquo;t want,
            please email{" "}
            <a href="mailto:info@nigerialex.com" className="text-green">
              info@nigerialex.com
            </a>{" "}
            and we&rsquo;ll remove you directly.
          </p>
        </>
      )}
      {(result.status === "missing" || result.status === "error") && (
        <>
          <h1 className="font-serif text-2xl text-navy">
            Something went wrong.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate">
            Please email{" "}
            <a href="mailto:info@nigerialex.com" className="text-green">
              info@nigerialex.com
            </a>{" "}
            and we&rsquo;ll unsubscribe you directly.
          </p>
        </>
      )}
    </div>
  );
}
