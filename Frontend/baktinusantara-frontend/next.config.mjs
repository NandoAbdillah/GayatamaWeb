/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/portfolio/:slug*',
        destination: '/portofolio/:slug*',
      },
      {
        source: '/portfolio',
        destination: '/portofolio',
      },
    ];
  },
};

export default nextConfig;
