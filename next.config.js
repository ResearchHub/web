/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: false,
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.prod.researchhub.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.staging.researchhub.com',
      },
      {
        protocol: 'https',
        hostname: 'iiif.elifesciences.org',
      },
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
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
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
