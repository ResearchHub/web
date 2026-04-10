import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = SITE_CONFIG.url;

async function fetchAllPages<T>(path: string): Promise<T[]> {
  if (!API_URL) {
    console.warn('[sitemap] NEXT_PUBLIC_API_URL is not set');
    return [];
  }

  const items: T[] = [];
  const deadline = Date.now() + 8_000;
  let url: string | null = `${API_URL}${path}`;

  while (url && items.length < 50_000 && Date.now() < deadline) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        next: { revalidate: 60 * 60 * 24 },
      });
      clearTimeout(timeout);
      if (!response.ok) {
        console.warn(`[sitemap] API returned ${response.status} for ${url}`);
        break;
      }
      const data: { next: string | null; results: T[] } = await response.json();
      items.push(...data.results);
      url = data.next;
    } catch (error) {
      console.warn(`[sitemap] Failed to fetch ${url}:`, error);
      break;
    }
  }

  return items;
}

function dedupe(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return entries.filter((entry) => !seen.has(entry.url) && seen.add(entry.url));
}

async function buildSlugSitemap(
  apiPath: string,
  urlPrefix: string,
  extract: (item: any) => { id: number; slug?: string } = (item) => item
): Promise<MetadataRoute.Sitemap> {
  const items = await fetchAllPages<any>(apiPath);
  return dedupe(
    items.map((item) => {
      const { id, slug } = extract(item);
      return {
        url: SITE_URL + urlPrefix + id + (slug ? '/' + slug : ''),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    })
  );
}

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
  { url: `${SITE_URL}/popular`, changeFrequency: 'hourly', priority: 0.9 },
  { url: `${SITE_URL}/latest`, changeFrequency: 'hourly', priority: 0.8 },
  { url: `${SITE_URL}/fund`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/fund/proposals`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/earn`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/grants`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/journal`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/browse`, changeFrequency: 'daily', priority: 0.6 },
  { url: `${SITE_URL}/lists`, changeFrequency: 'daily', priority: 0.5 },
  { url: `${SITE_URL}/leaderboard`, changeFrequency: 'daily', priority: 0.6 },
  { url: `${SITE_URL}/leaderboard/reviewers`, changeFrequency: 'daily', priority: 0.5 },
  { url: `${SITE_URL}/leaderboard/funders`, changeFrequency: 'daily', priority: 0.5 },
  { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/researchcoin`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/about/tos`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${SITE_URL}/about/privacy`, changeFrequency: 'yearly', priority: 0.3 },
];

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
}

export default async function sitemap({
  id,
}: {
  id: number | string;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = Number(id);
  if (sitemapId === 0) return STATIC_ROUTES;
  if (sitemapId === 1)
    return buildSlugSitemap(
      '/api/feed/?content_type=PAPER&page_size=100',
      '/paper/',
      (item) => item.content_object
    );

  if (sitemapId === 2) {
    const hubs = await fetchAllPages<{ slug: string }>('/api/hub/?page_size=100');
    return dedupe(
      hubs.map((hub) => ({
        url: `${SITE_URL}/topic/${hub.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }))
    );
  }

  if (sitemapId === 3)
    return buildSlugSitemap(
      '/api/researchhubpost/?document_type=PREREGISTRATION&page_size=100',
      '/proposal/'
    );
  if (sitemapId === 4)
    return buildSlugSitemap('/api/researchhubpost/?document_type=GRANT&page_size=100', '/grant/');

  return [];
}
