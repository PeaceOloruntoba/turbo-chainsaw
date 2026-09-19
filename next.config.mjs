import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Vercel manages the Next.js runtime itself. Standalone output is kept for
  // the cPanel Passenger deployment only.
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    cpus: 1,
    workerThreads: false,
  },

  webpack: (config) => {
    config.parallelism = 1
    return config
  },

  // Baseline browser security headers for every response. HSTS tells browsers
  // to use HTTPS only (the site must be served over HTTPS — cPanel AutoSSL /
  // Let's Encrypt). Sensitive routes are additionally marked non-cacheable.
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    ]
    return [
      { source: '/:path*', headers: security },
      {
        source: '/account/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/api/commercial-register/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
}

export default withPayload(nextConfig, {
  devBundleServerPackages: false,
})
