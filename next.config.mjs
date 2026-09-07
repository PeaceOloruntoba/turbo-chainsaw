import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
