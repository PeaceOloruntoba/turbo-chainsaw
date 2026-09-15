import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPayloadClient } from "@/lib/payload";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const title =
  "Nigeria Lex™ | Independent research. Market intelligence. Informed choice.";
const description =
  "Nigeria Lex is an independent, research-led legal market intelligence platform providing credible insight into the capabilities, experience and expertise of Nigeria's corporate law firms and practitioners.";

export async function generateMetadata(): Promise<Metadata> {
  // Favicon: falls back to the static src/app/icon.png file convention
  // (already the real Nigeria Lex mark) unless a favicon has been uploaded
  // in Site Settings, in which case that takes over.
  let iconUrl: string | undefined;
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings" });
    iconUrl = (settings?.favicon as any)?.url as string | undefined;
  } catch {
    // ignore — falls back to the static icon.png convention
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | Nigeria Lex™",
    },
    description,
    keywords: [
      "Nigeria legal market",
      "Nigerian law firms",
      "legal market intelligence",
      "Nigerian corporate law",
      "legal market research Nigeria",
    ],
    authors: [{ name: "Kaye & Crowther Limited" }],
    robots: { index: true, follow: true },
    ...(iconUrl ? { icons: { icon: iconUrl } } : {}),
    openGraph: {
      type: "website",
      siteName: "Nigeria Lex",
      title,
      description,
      url: siteUrl,
      images: [
        { url: "/logo-full.png", width: 1210, height: 772, alt: "Nigeria Lex" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo-full.png"],
    },
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nigeria Lex",
  alternateName: "Nigeria Lex™",
  url: siteUrl,
  logo: `${siteUrl}/logo-mark-512.png`,
  description,
  slogan: "Independent research. Market intelligence. Informed choice.",
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexSans.variable} ${sourceSerif.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
