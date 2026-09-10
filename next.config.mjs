import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `output: 'standalone'` produces the self-contained build the Dockerfile
  // (VPS deployment target) copies into its runtime image. On Vercel this
  // actively breaks the build: Vercel does its own build-output tracing and
  // expects to generate `.next/next-server.js.nft.json` itself, which
  // standalone mode skips, causing an ENOENT at the end of `next build`.
  // Vercel sets `VERCEL=1` during its builds, so only opt in when we're
  // building for Docker/VPS.
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  images: {
    remotePatterns: [
      // Allow images served from your S3 / CDN bucket. Replace with your real bucket host.
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME || 'localhost',
      },
      // Placeholder hero imagery (see homepage hero) — swap for the S3/CDN
      // host above once a real photo is uploaded through Payload.
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
