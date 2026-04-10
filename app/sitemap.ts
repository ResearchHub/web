import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = SITE_CONFIG.url;

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let url: string | null = `${API_URL}${path}`;

  while (url && items.length < 50_000) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 * 60 * 24 },
      });
      if (!response.ok) break;
      const data: { next: string | null; results: T[] } = await response.json();
      items.push(...data.results);
      url = data.next;
    } catch {
      break;
    }
  }

  return items;
}

function dedupe(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return entries.filter((entry) => !seen.has(entry.url) && seen.add(entry.url));
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
  return [{ id: 0 }, { id: 1 }, { id: 2 }];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  if (id === 0) return STATIC_ROUTES;

  if (id === 1) {
    const papers = await fetchAllPages<{ id: number; slug?: string }>('/api/paper/?page_size=1000');
    return dedupe(
      papers.map((paper) => ({
        url: `${SITE_URL}/paper/${paper.id}${paper.slug ? `/${paper.slug}` : ''}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    );
  }

  if (id === 2) {
    const hubs = await fetchAllPages<{ slug: string }>('/api/hub/?page_size=1000');
    return dedupe(
      hubs.map((hub) => ({
        url: `${SITE_URL}/topic/${hub.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }))
    );
  }

  return [];
}
