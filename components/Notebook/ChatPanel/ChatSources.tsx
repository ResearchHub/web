'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { NotebookChatSource } from '@/types/notebookChat';

interface ChatSourcesProps {
  sources: NotebookChatSource[];
}

/** How many to show before folding the rest away. */
const COLLAPSED_COUNT = 3;

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // A malformed url still deserves a row; the link just carries it as-is.
    return url;
  }
}

/**
 * Citations for one assistant turn — everything its tools returned with a
 * url, web search and scholarly lookups alike, already deduplicated.
 */
export function ChatSources({ sources }: ChatSourcesProps) {
  const [showAll, setShowAll] = useState(false);
  if (sources.length === 0) return null;

  const hidden = sources.length - COLLAPSED_COUNT;
  const visible = showAll ? sources : sources.slice(0, COLLAPSED_COUNT);

  return (
    <div className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-gray-500">Sources</span>
      <ul className="flex flex-col gap-1">
        {visible.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-1.5 text-gray-600 hover:text-primary-600"
            >
              <ExternalLink className="mt-[3px] h-3 w-3 shrink-0 text-gray-400 group-hover:text-primary-600" />
              <span className="min-w-0">
                <span className="break-words underline decoration-gray-300 underline-offset-2 group-hover:decoration-primary-400">
                  {source.title || hostname(source.url)}
                </span>
                {source.title && <span className="text-gray-400"> · {hostname(source.url)}</span>}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {hidden > 0 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="self-start text-gray-400 transition-colors hover:text-gray-600"
        >
          +{hidden} more
        </button>
      )}
    </div>
  );
}
