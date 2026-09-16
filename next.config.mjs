import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `output: 'standalone'` produces the self-contained build the cPanel
  // deployment (see DEPLOY_CPANEL.md) copies into its runtime. On Vercel
  // this actively breaks the build: Vercel does its own build-output
  // tracing and expects to generate `.next/next-server.js.nft.json`
  // itself, which standalone mode skips, causing an ENOENT at the end of
  // `next build`. Vercel sets `VERCEL=1` during its builds, so only opt
  // in when we're building for cPanel.
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  images: {
    remotePatterns: [
      // Placeholder hero imagery (see homepage hero + PageIntro banners) —
      // safe to keep even after moving uploads to local disk, since this
      // is unrelated to Payload Media (logos, lawyer photos, PDFs), which
      // now live on the server's own filesystem and are same-origin.
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
