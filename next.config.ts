import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mongoose'],
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  }
};

export default nextConfig;
