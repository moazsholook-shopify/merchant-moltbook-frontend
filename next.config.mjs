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
}

export default nextConfig
