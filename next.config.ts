import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize for Firebase Hosting with 2nd Gen Functions
  output: 'standalone',
  // Reduce static generation timeout to avoid deployment timeouts
  staticPageGenerationTimeout: 120,
  // Optimize images
  images: {
    domains: ['transflow2-0.web.app', 'transflow2-0.firebaseapp.com'],
    // Always optimize images in production
    unoptimized: process.env.NODE_ENV !== 'production',
    // Limit image sizes to reduce bundle
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
  },
  // Disable unnecessary features for SSR function
  experimental: {
    // Optimize page loading
    optimizeCss: true,
    // Optimize bundle size
    optimizeServerReact: true,
  },
  // Reduce the size of server components
  serverExternalPackages: ['firebase'],
  // Remove console logs in production to reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Configure webpack for optimal bundle size
  webpack: (config, { dev, isServer }) => {
    // Optimize chunks
    if (!dev && isServer) {
      config.optimization.minimize = true;
    }

    return config;
  },
};

export default nextConfig;
