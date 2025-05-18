const path = require('path');
const loaderUtils = require('loader-utils');

// CSS Module class name hashing function
const hashOnlyIdent = (context, _, exportName) =>
  loaderUtils
    .getHashDigest(
      Buffer.from(
        `filePath:${path
          .relative(context.rootContext, context.resourcePath)
          .replace(/\\+/g, '/')}#className:${exportName}`
      ),
      'md4',
      'base64',
      6
    )
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/^(-?\d|--)/, '_$1');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Permissions-Policy',
          value:
            'camera=(self "https://*.withpersona.com/"), geolocation=(), gyroscope=(), microphone=()',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
      ],
    },
  ],
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
      {
        protocol: 'https',
        hostname: 'researchhub-dev-storage.s3.amazonaws.com',
      },
    ],
  },
  productionBrowserSourceMaps: process.env.VERCEL_ENV === 'preview',
  modularizeImports: {
    'lodash-es': {
      transform: 'lodash-es/{{member}}',
    },
  },
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
      },
    },
    resolveAlias: {
      '@': __dirname,
    },
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config, { dev, isServer }) => {
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

    // Add CSS Module class name hashing in production
    if (!dev) {
      const rules = config.module.rules
        .find((rule) => typeof rule.oneOf === 'object')
        .oneOf.filter((rule) => Array.isArray(rule.use));

      rules.forEach((rule) => {
        rule.use.forEach((moduleLoader) => {
          if (
            moduleLoader.loader?.includes('css-loader') &&
            !moduleLoader.loader?.includes('postcss-loader')
          ) {
            moduleLoader.options.modules.getLocalIdent = hashOnlyIdent;
          }
        });
      });
    }

    return config;
  },
};

module.exports = nextConfig;
