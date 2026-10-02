/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  basePath: "/apps/cyber-lottery",
  experimental: { cpus: 1 },
}

module.exports = nextConfig
