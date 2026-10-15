import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/verify/',
        '/reset/',
        '/org/join/',
        '/note/join/',
        '/notifications/',
        '/activity/',
        '/my-funding',
        '/notebook/',
        '/moderators/',
        '/expert-finder/',
        '/settings',
        '/_next/',
        '/sw.js',
      ],
      other: { 'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes' },
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
