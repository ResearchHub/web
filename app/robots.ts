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
        '/dashboard/',
        '/notifications/',
        '/activity/',
        '/for-you/',
        '/following/',
        '/notebook/',
        '/moderators/',
        '/expert-finder/',
        '/paper/create',
        '/paper/submit',
      ],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
