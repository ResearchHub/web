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
        next: { revalidate: 3600 },
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

interface SitemapPost {
  id: number;
  slug: string;
  updated_date: string;
}

// The backend's sitemap action returns only public, non-removed posts of one
// type, with just the fields a URL needs.
async function buildPostSitemap(
  documentType: string,
  urlPrefix: string
): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPages<SitemapPost>(
    `/api/researchhubpost/sitemap/?document_type=${documentType}`
  );
  return dedupe(
    posts.map((post) => ({
      url: SITE_URL + urlPrefix + post.id + (post.slug ? '/' + post.slug : ''),
      lastModified: post.updated_date,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );
}

// Public pages only: routes gated by the auth matcher in proxy.ts (such as
// /lists) redirect crawlers to login, so they don't belong here.
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
  { url: `${SITE_URL}/fund`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${SITE_URL}/fund/proposals`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/peer-review`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/journal`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/researchcoin`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/tos`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
];

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }];
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = Number(await id);
  if (sitemapId === 0) return STATIC_ROUTES;
  if (sitemapId === 1) return buildPostSitemap('PREREGISTRATION', '/proposal/');
  if (sitemapId === 2) return buildPostSitemap('GRANT', '/rfp/');

  return [];
}
