/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    return config;
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/sign-in',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;