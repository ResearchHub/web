'use client';

import { useEffect } from 'react';
import { Work } from '@/types/work';
import { SearchSuggestion } from '@/types/search';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_RECENT_VIEWS = 10;

interface SearchHistoryTrackerProps {
  work: Work;
}

// Helper functions to handle localStorage
const getSearchHistory = (): SearchSuggestion[] => {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveSearchHistory = (items: SearchSuggestion[]) => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export function SearchHistoryTracker({ work }: SearchHistoryTrackerProps) {
  useEffect(() => {
    // Get existing history
    const history = getSearchHistory();

    // Create new suggestion from work
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
    };

    // Update or add the current suggestion
    const existingIndex = history.findIndex((item) => item.id === work.id);

    if (existingIndex !== -1) {
      // Remove from current position
      history.splice(existingIndex, 1);
    }

    // Add to the start of history
    history.unshift(newSuggestion);

    // Keep only the most recent suggestions
    if (history.length > MAX_RECENT_VIEWS) {
      history.pop();
    }

    // Save updated history
    saveSearchHistory(history);
  }, [work]);

  return null; // This component doesn't render anything
}
