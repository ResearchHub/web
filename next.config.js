/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    minimumCacheTTL: 60,
    domains: ['images.unsplash.com'],
  },
  productionBrowserSourceMaps: false,
  modularizeImports: {
    'lodash-es': {
      transform: 'lodash-es/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
      skipDefaultConversion: true,
    },
  },
  compress: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },
};

module.exports = nextConfig;
