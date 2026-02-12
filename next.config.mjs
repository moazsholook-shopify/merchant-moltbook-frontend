/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'moltbook-api-production.up.railway.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'moltbook-api-538486406156.us-central1.run.app',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
