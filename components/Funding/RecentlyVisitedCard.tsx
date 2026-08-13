'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSearchHistory, clearSearchHistory, MAX_HISTORY_ITEMS } from '@/utils/searchHistory';
import { buildWorkUrl } from '@/utils/url';
import { SearchSuggestion } from '@/types/search';
import { ContentType } from '@/types/work';
import { cn } from '@/utils/styles';

const WORK_TYPE_LABELS: Record<string, string> = {
  paper: 'Paper',
  post: 'Post',
  preregistration: 'Proposal',
  question: 'Question',
  discussion: 'Discussion',
  funding_request: 'Request for Proposal',
};

const SKELETON_ROWS = [
  { title: ['w-[92%]', 'w-[68%]'], meta: 'w-16' },
  { title: ['w-[85%]', 'w-[55%]'], meta: 'w-14' },
  { title: ['w-[90%]', 'w-[72%]'], meta: 'w-20' },
  { title: ['w-[78%]', 'w-[48%]'], meta: 'w-14' },
  { title: ['w-[88%]', 'w-[60%]'], meta: 'w-16' },
] as const;

interface RecentPage {
  href: string;
  title: string;
  typeLabel?: string;
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
      typeLabel: WORK_TYPE_LABELS[contentType],
    };
  }

  if (visit.entityType === 'post') {
    return {
      href: visit.url || `/post/${visit.id}`,
      title,
      typeLabel: WORK_TYPE_LABELS.post,
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
    if (collected.length === MAX_HISTORY_ITEMS) break;
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
 * Lightweight browsing history for the Activity sidebar: a plain text list of
 * documents from local visit history, no thumbnails or metrics.
 */
export function RecentlyVisitedCard({ pages, clear, className }: RecentlyVisitedCardProps) {
  if (pages.length === 0) return null;

  return (
    <aside className={cn('w-[250px]', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Recently visited
        </p>
        <button
          type="button"
          onClick={clear}
          className="shrink-0 text-[11px] font-semibold text-gray-400 transition-colors hover:text-gray-700"
        >
          Clear
        </button>
      </div>

      <ul className="-mx-2 mt-1.5">
        {pages.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="block rounded-md px-2 py-1.5 transition-colors hover:bg-white"
            >
              <span className="line-clamp-2 text-[13px] font-medium leading-snug text-gray-700">
                {page.title}
              </span>
              {page.typeLabel && (
                <span className="mt-0.5 block text-[11px] text-gray-400">{page.typeLabel}</span>
              )}
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
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="h-3 w-10 rounded bg-gray-200" />
      </div>
      <ul className="-mx-2 mt-1.5">
        {SKELETON_ROWS.map((row) => (
          <li key={row.meta + row.title[0]} className="px-2 py-1.5">
            <div className="space-y-1.5">
              <div className={cn('h-3.5 rounded bg-gray-200', row.title[0])} />
              <div className={cn('h-3.5 rounded bg-gray-200', row.title[1])} />
            </div>
            <div className={cn('mt-1.5 h-2.5 rounded bg-gray-200', row.meta)} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
