import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Experimental features
  experimental: {
    // Enable server actions for execution API
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
