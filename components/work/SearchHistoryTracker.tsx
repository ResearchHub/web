'use client';

import { useEffect } from 'react';
import { Work } from '@/types/work';
import { getSearchHistory, saveSearchHistory, MAX_HISTORY_ITEMS } from '@/utils/searchHistory';
import { SearchSuggestion } from '@/types/search';

interface SearchHistoryTrackerProps {
  work: Work;
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
    };

    const existingIndex = history.findIndex((item) => item.id === work.id);
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
