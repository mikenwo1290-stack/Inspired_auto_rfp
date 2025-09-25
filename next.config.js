/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure environment variables that will be available on both server and client side
  env: {
    // You will need to set LLAMACLOUD_API_KEY in your deployment environment
    // or in a .env.local file that's not committed to version control
    LLAMACLOUD_API_KEY: process.env.LLAMACLOUD_API_KEY,
    // Internal API key for internal users
    LLAMACLOUD_API_KEY_INTERNAL: process.env.LLAMACLOUD_API_KEY_INTERNAL,
    // Internal email domain (defaults to @runllama.ai)
    INTERNAL_EMAIL_DOMAIN: process.env.INTERNAL_EMAIL_DOMAIN,
  },
  // Other Next.js config options
  reactStrictMode: true,
  // Configure for Replit environment
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Allow all hosts for Replit proxy
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig; 