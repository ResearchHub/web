import { SITE_CONFIG } from '@/lib/metadata';
import { generateSitemaps } from '@/app/sitemap';

// Sitemap index: `generateSitemaps` only serves the /sitemap/<id>.xml chunks.
// Served at /sitemap.xml (the URL robots.txt advertises) through a rewrite in
// next.config.js, because Next reserves app/sitemap.xml for app/sitemap.ts.
export async function GET() {
  const sitemaps = await generateSitemaps();
  const entries = sitemaps
    .map(({ id }) => `  <sitemap><loc>${SITE_CONFIG.url}/sitemap/${id}.xml</loc></sitemap>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
