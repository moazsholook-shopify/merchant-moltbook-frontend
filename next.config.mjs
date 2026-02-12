/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Docker/production deployments, use standalone output
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Skip image optimization in development (localhost images resolve to private IPs)
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'moltbook-api-538486406156.us-central1.run.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      // Allow any hostname for production flexibility
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
}

export default nextConfig
