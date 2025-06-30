/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  redirects: async () => [
    {
      source: '/fund',
      destination: '/fund/grants',
      permanent: false,
    },
    {
      source: '/researchhub-journal',
      destination: '/journal',
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Permissions-Policy',
          value:
            'camera=(self "https://*.withpersona.com/"), geolocation=(), gyroscope=(), microphone=(self "https://*.withpersona.com/")',
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
        {
          key: 'X-Robots-Tag',
          value: 'index, follow',
        },
      ],
    },
  ],
  images: {
    unoptimized: false,
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
        hostname: 'storage.dev.researchhub.com',
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
    formats: ['image/webp', 'image/avif'],
  },
  productionBrowserSourceMaps: process.env.VERCEL_ENV === 'preview',
  modularizeImports: {
    'lodash-es': {
      transform: 'lodash-es/{{member}}',
    },
  },
  compress: true,
  compiler: {
    removeConsole: process.env.VERCEL_ENV === 'production',
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
