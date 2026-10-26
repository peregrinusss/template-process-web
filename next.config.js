/** @type {import('next').NextConfig} */
const nextConfig = {
  // Для локального использования без сервера можно использовать 'export'
  // output: 'export',
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

module.exports = nextConfig;
