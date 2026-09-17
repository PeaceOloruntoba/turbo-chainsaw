import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),

  typescript: {
    ignoreBuildErrors: true,
  },

  // Restrict static page generation to 1 thread to avoid NPROC and RAM limits
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackMemoryOptimizations: true,
  },

  productionBrowserSourceMaps: false,

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
