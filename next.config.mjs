import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),

  // Disable in-memory TypeScript type checking to prevent memory spikes
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint checking during build as well to save RAM
  eslint: {
    ignoreDuringBuilds: true,
  },

  productionBrowserSourceMaps: false,

  experimental: {
    webpackMemoryOptimizations: true,
  },

  webpack: (config) => {
    config.parallelism = 1;
    config.cache = false;
    return config;
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
