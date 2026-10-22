import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Link-card images live under /api/og; crawlers that build link previews
      // (Twitterbot, LinkedInBot, ...) skip images robots.txt disallows. The
      // longer Allow path wins over `/api/` (RFC 9309 longest match).
      allow: ['/', '/api/og'],
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
      // Content Signals (contentsignals.org) declare how AI systems may use the
      // site's content: model training (ai-train), search results (search), and
      // answers grounded on the content (ai-input). All are allowed because
      // user-contributed content is CC BY 4.0. Next writes `other` entries as
      // raw `Key: value` lines under this User-Agent block.
      other: { 'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes' },
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
