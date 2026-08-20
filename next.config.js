/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  redirects: async () => [
    {
      source: '/funding',
      destination: '/fund',
      permanent: false,
    },
    {
      source: '/funding/:path*',
      destination: '/fund/:path*',
      permanent: false,
    },
    {
      source: '/researchhub-journal',
      destination: '/journal',
      permanent: true,
    },
    {
      source: '/journal/:slug',
      destination: '/topic/:slug',
      permanent: true,
    },
    {
      source: '/trending',
      destination: '/',
      permanent: true,
    },
    {
      source: '/popular',
      destination: '/',
      permanent: true,
    },
    {
      source: '/latest',
      destination: '/',
      permanent: true,
    },
    {
      source: '/for-you',
      destination: '/',
      permanent: true,
    },
    {
      source: '/following',
      destination: '/',
      permanent: true,
    },
    // Retired experiment route: /feed-v2 became the homepage, and its children
    // map 1:1 onto the top-level equivalents (/feed-v2/fund -> /fund).
    {
      source: '/feed-v2',
      destination: '/',
      permanent: false,
    },
    {
      source: '/feed-v2/:path*',
      destination: '/:path*',
      permanent: false,
    },
    {
      source: '/fund/dashboard',
      destination: '/my-funding',
      permanent: true,
    },
    {
      source: '/grant/:id(\\d+)/:slug/applications',
      destination: '/grant/:id/:slug',
      permanent: true,
    },
    {
      source: '/grant/:id(\\d+)/:slug/conversation',
      destination: '/grant/:id/:slug',
      permanent: true,
    },
    {
      source: '/earn',
      destination: '/peer-review',
      permanent: true,
    },
    {
      source: '/earn/:path*',
      destination: '/peer-review',
      permanent: true,
    },
    {
      source: '/fund/:id(\\d+)',
      destination: '/proposal/:id',
      permanent: true,
    },
    {
      source: '/fund/:id(\\d+)/:path*',
      destination: '/proposal/:id/:path*',
      permanent: true,
    },
    {
      source: '/about/tos',
      destination: '/tos',
      permanent: true,
    },
    {
      source: '/about/privacy',
      destination: '/privacy',
      permanent: true,
    },
    // Migrated ResearchHub Journal registered reports (paper → report)
    {
      source:
        '/paper/11152100/effects-of-psilocybin-and-related-compounds-on-cerebroprotection-during-ischemic-stroke-stage-1-registered-report',
      destination:
        '/report/32656/effects-of-psilocybin-and-related-compounds-on-cerebroprotection-during-ischemic-stroke-stage-1-registered-report',
      permanent: true,
    },
    {
      source:
        '/paper/11187443/enhancing-engineered-cell-therapies-for-cns-conditions-final-stage-1-registered-report',
      destination:
        '/report/32654/enhancing-engineered-cell-therapies-for-cns-conditions-stage-1-registered-report',
      permanent: true,
    },
    {
      source:
        '/paper/11191504/sleep-fragmentation-in-neuronal-a42-expressing-drosophila-replication-study-stage-1-registered-report',
      destination:
        '/report/32653/sleep-fragmentation-in-neuronal-a42-expressing-drosophila-replication-study-stage-1-registered-report',
      permanent: true,
    },
    {
      source:
        '/paper/11181913/sirt6-deficiency-in-microvascular-mural-cells-as-a-driver-of-paracrine-senescence-and-impaired-regeneration-in-ischemic-limbs-stage-1-registered-report',
      destination:
        '/report/32651/sirt6-deficiency-in-microvascular-mural-cells-as-a-driver-of-paracrine-senescence-and-impaired-regeneration-in-ischemic-limbs-stage-1-registered-report',
      permanent: true,
    },
    {
      source:
        '/paper/11152101/de-novo-protein-binder-design-for-advanced-glycation-end-products-a-computational-approach-to-targeting-age-related-glycative-damage-stage-1-registered-report',
      destination:
        '/report/32652/de-novo-protein-binder-design-for-advanced-glycation-end-products-a-computational-approach-to-targeting-age-related-glycative-damage-stage-1-registered-report',
      permanent: true,
    },
    {
      source:
        '/paper/11186571/neurosc-leveraging-pretrained-single-cell-models-for-brain-cell-classification-stage-1-registered-report',
      destination:
        '/report/32655/neurosc-leveraging-pretrained-single-cell-models-for-brain-cell-classification-stage-1-registered-report',
      permanent: true,
    },
    {
      source:
        '/paper/11257106/identifying-the-point-of-no-return-integrating-single-cell-transcriptomics-and-proteomics-to-map-irreversible-fibroblast-commitment-in-idiopathic-pulmonary-fibrosis-stage-1-registered-report',
      destination:
        '/report/32650/identifying-the-point-of-no-return-integrating-single-cell-transcriptomics-and-proteomics-to-map-irreversible-fibroblast-commitment-in-idiopathic-pulmonary-fibrosis-stage-1-registered-report',
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
    qualities: [75, 95],
  },
  productionBrowserSourceMaps: process.env.VERCEL_ENV === 'preview',
  modularizeImports: {
    'lodash-es': {
      transform: 'lodash-es/{{member}}',
    },
  },
  compress: true,
  // compiler: {
  //   removeConsole: process.env.VERCEL_ENV === 'production',
  // },
  turbopack: {
    resolveAlias: {
      '@': __dirname,
    },
  },
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
