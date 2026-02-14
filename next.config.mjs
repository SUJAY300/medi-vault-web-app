/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Silences warning about multiple lockfiles (pnpm-lock.yaml in project)
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
