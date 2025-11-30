import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  serverExternalPackages: ['mcp-servers'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'oikhfoaltormcigauobs.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
