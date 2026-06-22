const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "thejuneberry.sgp1.digitaloceanspaces.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:countryCode/shop",
        destination: "/:countryCode/store",
        permanent: true,
      },
      {
        source: "/shop",
        destination: "/store",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
