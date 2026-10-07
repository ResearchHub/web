'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSearchHistory, clearSearchHistory } from '@/utils/searchHistory';
import { buildWorkUrl } from '@/utils/url';
import { formatTimeAgo } from '@/utils/date';
import { SearchSuggestion } from '@/types/search';
import { ContentType } from '@/types/work';
import { cn } from '@/utils/styles';
import { RecentlyVisitedThumbnail } from './RecentlyVisitedThumbnail';

/**
 * Storage keeps more visits than the rail lists (the search modal reads them
 * too); six rows fit under the funding power card on a 900px-tall window.
 */
const MAX_VISIBLE = 6;

const SKELETON_ROWS = [
  { title: ['w-[92%]', 'w-[68%]'], meta: 'w-16' },
  { title: ['w-[85%]', 'w-[55%]'], meta: 'w-14' },
  { title: ['w-[90%]', 'w-[72%]'], meta: 'w-20' },
  { title: ['w-[78%]', 'w-[48%]'], meta: 'w-14' },
  { title: ['w-[88%]', 'w-[60%]'], meta: 'w-16' },
  { title: ['w-[82%]', 'w-[64%]'], meta: 'w-12' },
] as const;

interface RecentPage {
  href: string;
  title: string;
  isPaper: boolean;
  imageUrl?: string;
  authorImage?: string;
  /** ISO time of the visit; entries saved before it was recorded have none. */
  lastVisited?: string;
}

export interface RecentlyVisited {
  pages: RecentPage[];
  clear: () => void;
  isHydrated: boolean;
}

/** Stored visit record — shares the search-history localStorage shape. */
type VisitRecord = SearchSuggestion;

function toRecentPage(visit: VisitRecord): RecentPage | null {
  const title = visit.displayName?.trim();
  if (!title) return null;

  if (visit.entityType === 'paper') {
    const contentType = (visit.contentType || 'paper') as ContentType;
    const href = buildWorkUrl({
      id: visit.id,
      contentType,
      doi: 'doi' in visit ? visit.doi : undefined,
      slug: visit.slug,
    });
    if (!href || href === '#') return null;
    return {
      href,
      title,
      isPaper: contentType === 'paper',
      imageUrl: visit.imageUrl,
      authorImage: visit.authorImage,
      lastVisited: visit.lastVisited,
    };
  }

  if (visit.entityType === 'post') {
    return {
      href: visit.url || `/post/${visit.id}`,
      title,
      isPaper: false,
    };
  }

  // Skip users / hubs — this sidebar is for visited documents only.
  return null;
}

function visitsToPages(visits: VisitRecord[]): RecentPage[] {
  const collected: RecentPage[] = [];
  const seen = new Set<string>();

  for (const visit of visits) {
    const page = toRecentPage(visit);
    if (!page || seen.has(page.href)) continue;
    seen.add(page.href);
    collected.push(page);
    if (collected.length === MAX_VISIBLE) break;
  }

  return collected;
}

/**
 * The viewer's recent pages plus the ability to forget them. Lifted out of the
 * card so the surrounding column can drop the section entirely once it's
 * cleared, rather than leaving an empty panel behind.
 *
 * Same localStorage + event pattern as useSearchSuggestions.
 */
export function useRecentlyVisited(): RecentlyVisited {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setVisits(getSearchHistory());
    setIsHydrated(true);

    const handleStorageChange = () => {
      setVisits(getSearchHistory());
    };

    window.addEventListener('search-history-updated', handleStorageChange);
    return () => {
      window.removeEventListener('search-history-updated', handleStorageChange);
    };
  }, []);

  const pages = useMemo(() => visitsToPages(visits), [visits]);

  const clear = useCallback(() => {
    clearSearchHistory();
    setVisits([]);
  }, []);

  return { pages, clear, isHydrated };
}

interface RecentlyVisitedCardProps extends Omit<RecentlyVisited, 'isHydrated'> {
  className?: string;
}

/**
 * Browsing history for the Activity sidebar: documents from local visit
 * history, each with its picture and when it was last opened.
 */
export function RecentlyVisitedCard({ pages, clear, className }: RecentlyVisitedCardProps) {
  if (pages.length === 0) return null;

  return (
    <aside className={cn('w-[250px]', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-500">Recently visited</p>
        <button
          type="button"
          onClick={clear}
          className="shrink-0 text-xs font-medium text-gray-400 transition-colors hover:text-gray-700"
        >
          Clear
        </button>
      </div>

      <ul className="-mx-2 mt-2 flex flex-col gap-0.5">
        {pages.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="flex items-start gap-3 rounded-[10px] p-2 transition-colors hover:bg-white"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-[3px] pt-px">
                {page.lastVisited && (
                  <span className="text-[11px] leading-tight text-gray-500">
                    {formatTimeAgo(page.lastVisited)}
                  </span>
                )}
                <span className="line-clamp-2 text-[13px] font-medium leading-snug text-gray-900">
                  {page.title}
                </span>
              </span>
              <RecentlyVisitedThumbnail
                imageUrl={page.imageUrl}
                authorImage={page.authorImage}
                isPaper={page.isPaper}
              />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Placeholder shown until localStorage history is readable after hydration. */
export function RecentlyVisitedCardSkeleton({ className }: { className?: string }) {
  return (
    <aside className={cn('w-[250px] animate-pulse', className)} aria-hidden>
      <div className="flex items-center justify-between gap-2">
        <div className="h-3.5 w-28 rounded bg-gray-200" />
        <div className="h-3 w-10 rounded bg-gray-200" />
      </div>
      <ul className="-mx-2 mt-2 flex flex-col gap-0.5">
        {SKELETON_ROWS.map((row) => (
          <li key={row.meta + row.title[0]} className="flex items-start gap-3 p-2">
            <div className="min-w-0 flex-1 space-y-1.5 pt-px">
              <div className={cn('h-2.5 rounded bg-gray-200', row.meta)} />
              <div className={cn('h-3.5 rounded bg-gray-200', row.title[0])} />
              <div className={cn('h-3.5 rounded bg-gray-200', row.title[1])} />
            </div>
            <div className="h-12 w-12 shrink-0 rounded-[10px] bg-gray-200" />
          </li>
        ))}
      </ul>
    </aside>
  );
}
