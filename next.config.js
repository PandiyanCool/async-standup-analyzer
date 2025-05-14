/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        bufferutil: false,
        "utf-8-validate": false,
        encoding: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
