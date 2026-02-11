/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
}

export default nextConfig
