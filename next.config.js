/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    minimumCacheTTL: 60,
    domains: [
      'images.unsplash.com',
      'storage.prod.researchhub.com',
      'pbs.twimg.com',
      'lh3.googleusercontent.com',
    ],
  },
  productionBrowserSourceMaps: process.env.VERCEL_ENV === 'preview',
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
  webpack: (config, { isServer }) => {
    // Preserve existing alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };

    if (!isServer) {
      // Add fallbacks for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };

      // Handle PDF.js worker
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[hash][ext][query]',
        },
      });
    }

    return config;
  },
};

module.exports = nextConfig;
