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
        '/note/join/',
        '/notifications/',
        '/activity/',
        '/my-funding',
        '/notebook/',
        '/moderators/',
        '/expert-finder/',
        '/settings',
        '/_next/',
        '/md/',
        '/sw.js',
      ],
      // Content Signals (contentsignals.org) declare how AI systems may use the
      // site's content: model training (ai-train), search results (search), and
      // answers grounded on the content (ai-input). Training is allowed for
      // public CC BY content. Peer review content stays excluded: Terms of
      // Service section 4A forbids training on it and controls if a signal
      // conflicts, which a single robots line cannot express. See public/ai.txt.
      // Next writes `other` entries as raw `Key: value` lines under this
      // User-Agent block.
      other: { 'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes' },
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
