/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'together.ai' },
      { protocol: 'https', hostname: '*.together.ai' },
      { protocol: 'https', hostname: 'cdn.together.ai' },
      { protocol: 'https', hostname: 'api.together.xyz' },
    ],
  },
}

module.exports = nextConfig
