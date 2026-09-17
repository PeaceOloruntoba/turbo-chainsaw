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
