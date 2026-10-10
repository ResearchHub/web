'use client';

import { useEffect } from 'react';
import { Work } from '@/types/work';
import { getSearchHistory, saveSearchHistory, MAX_HISTORY_ITEMS } from '@/utils/searchHistory';
import { SearchSuggestion } from '@/types/search';

interface SearchHistoryTrackerProps {
  work: Work;
}

/** Papers and posts number their ids separately, so a visit is keyed by both. */
function isSameWork(item: SearchSuggestion, work: Work): boolean {
  if (item.entityType !== 'paper' || item.id !== work.id) return false;
  return (item.contentType ?? 'paper') === work.contentType;
}

export function SearchHistoryTracker({ work }: SearchHistoryTrackerProps) {
  useEffect(() => {
    const history = [...getSearchHistory()];

    const newSuggestion: SearchSuggestion = {
      id: work.id,
      entityType: 'paper',
      displayName: work.title,
      authors: work.authors.map((a) => a.authorProfile.fullName),
      doi: work.doi || '',
      citations: 0,
      source: 'researchhub',
      openalexId: '',
      isRecent: true,
      slug: work.slug,
      contentType: work.contentType,
      lastVisited: new Date().toISOString(),
      imageUrl: work.image || work.figures?.[0]?.url || undefined,
      authorImage:
        work.authors.find((a) => a.authorProfile?.profileImage)?.authorProfile.profileImage ||
        undefined,
    };

    const existingIndex = history.findIndex((item) => isSameWork(item, work));
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }

    history.unshift(newSuggestion);

    if (history.length > MAX_HISTORY_ITEMS) {
      history.length = MAX_HISTORY_ITEMS;
    }

    saveSearchHistory(history);
  }, [work]);

  return null; // This component doesn't render anything
}
