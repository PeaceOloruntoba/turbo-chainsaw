import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),

  // Disable source map generation to keep memory low
  productionBrowserSourceMaps: false,

  // Force Webpack memory-saving options
  experimental: {
    webpackMemoryOptimizations: true,
  },

  webpack: (config, { isServer }) => {
    // Force Webpack to run on a single thread to avoid exceeding CloudLinux CPU/LVE limits
    config.parallelism = 1;
    
    // Disable heavy cache writing to disk during build
    config.cache = false;

    return config;
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

export default withPayload(nextConfig, { devBundleServerPackages: false })
