'use client';

import { ExternalLink, Globe } from 'lucide-react';
import type { ChatActivitySource, NotebookChat } from '@/types/notebookChat';
import { collectSources, hostnameOf } from './ActivityFeed';

/**
 * Every citation the assistant produced in one chat, deduplicated by URL and
 * ordered oldest turn first. Derived from the activity feed rather than fetched
 * — the transcript already carries the sources, they're just buried per tool
 * call, which makes them hard to use once a chat runs long.
 */
export function collectChatSources(chat: NotebookChat | null): ChatActivitySource[] {
  const byUrl = new Map<string, ChatActivitySource>();
  for (const execution of chat?.executions ?? []) {
    for (const source of collectSources(execution.activity ?? [])) {
      if (!byUrl.has(source.url)) byUrl.set(source.url, source);
    }
  }
  return Array.from(byUrl.values());
}

interface ChatSourcesProps {
  readonly sources: ChatActivitySource[];
}

export function ChatSources({ sources }: ChatSourcesProps) {
  if (sources.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <Globe className="h-5 w-5 text-gray-300" aria-hidden="true" />
        <p className="font-serif text-base text-gray-800">No sources yet</p>
        <p className="text-xs leading-relaxed text-gray-500">
          Anything the assistant cites while searching the web or the literature collects here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {sources.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
          >
            <Globe
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-primary-500"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-gray-800 group-hover:text-primary-700">
                {source.title || hostnameOf(source.url)}
              </span>
              <span className="block truncate text-xs text-gray-400">{hostnameOf(source.url)}</span>
            </span>
            <ExternalLink
              className="mt-0.5 h-3 w-3 shrink-0 text-transparent group-hover:text-gray-400"
              aria-hidden="true"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
