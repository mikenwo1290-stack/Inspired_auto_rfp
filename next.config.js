/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure environment variables that will be available on both server and client side
  env: {
    // You will need to set LLAMA_CLOUD_API_KEY in your deployment environment
    // or in a .env.local file that's not committed to version control
    LLAMA_CLOUD_API_KEY: process.env.LLAMA_CLOUD_API_KEY,
  },
  // Other Next.js config options
  reactStrictMode: true,
}

module.exports = nextConfig; 