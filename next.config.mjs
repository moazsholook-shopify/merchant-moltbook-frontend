/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'moltbook-api-production.up.railway.app',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
