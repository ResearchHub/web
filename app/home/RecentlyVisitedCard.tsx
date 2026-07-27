'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { getEntryMeta } from '@/components/Activity/lib/feedEntryAdapters';
import { cn } from '@/utils/styles';

const MAX_ITEMS = 5;

const ENTRY_TYPE_LABELS: Record<string, string> = {
  GRANT: 'Request for Proposal',
  PREREGISTRATION: 'Proposal',
  USDFUNDRAISECONTRIBUTION: 'Proposal',
  PURCHASE: 'Proposal',
  PAPER: 'Paper',
  POST: 'Post',
};

/** Comment/bounty entries point at a document, so label them by that work. */
const WORK_TYPE_LABELS: Record<string, string> = {
  paper: 'Paper',
  post: 'Post',
  preregistration: 'Proposal',
  question: 'Question',
  discussion: 'Discussion',
  funding_request: 'Request for Proposal',
};

interface RecentPage {
  href: string;
  title: string;
  typeLabel?: string;
}

export interface RecentlyVisited {
  pages: RecentPage[];
  clear: () => void;
}

/**
 * The viewer's recent pages plus the ability to forget them. Lifted out of the
 * card so the surrounding column can drop the section entirely once it's
 * cleared, rather than leaving an empty panel behind.
 */
export function useRecentlyVisited(): RecentlyVisited {
  const { entries, isLoading } = useActivityFeed();
  const [isCleared, setIsCleared] = useState(false);

  const pages = useMemo(() => {
    const collected: RecentPage[] = [];
    const seen = new Set<string>();

    for (const entry of entries) {
      const { title, href } = getEntryMeta(entry);
      if (!title || !href || seen.has(href)) continue;
      seen.add(href);
      const relatedType = entry.relatedWork?.contentType;
      collected.push({
        href,
        title,
        typeLabel:
          ENTRY_TYPE_LABELS[entry.contentType] ??
          (relatedType ? WORK_TYPE_LABELS[relatedType] : undefined),
      });
      if (collected.length === MAX_ITEMS) break;
    }

    return collected;
  }, [entries]);

  const clear = useCallback(() => setIsCleared(true), []);

  return { pages: isLoading || isCleared ? [] : pages, clear };
}

interface RecentlyVisitedCardProps extends RecentlyVisited {
  className?: string;
}

/**
 * Lightweight browsing history for the home hub's right column: a plain text
 * list of the documents the viewer last opened, no thumbnails or metrics.
 * Sources the activity feed until real visit tracking exists.
 */
export function RecentlyVisitedCard({ pages, clear, className }: RecentlyVisitedCardProps) {
  if (pages.length === 0) return null;

  return (
    <aside className={cn('w-[250px]', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
