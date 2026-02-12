/** @type {import('next').NextConfig} */
const nextConfig = {
  // Always use standalone output for consistent builds
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Images are fully-qualified GCS signed URLs — no optimization needed
    unoptimized: true,
  },
  // Proxy /api/v1 to local backend in dev (only when BACKEND_URL is set)
  // This NEVER gets baked into production builds since the env var isn't set at build time
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },
}

export default nextConfig
